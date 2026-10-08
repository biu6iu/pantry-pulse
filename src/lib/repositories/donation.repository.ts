import { prisma } from "@/lib/config/db";
import {
  IDonationRepository,
  DonationFilters,
  OverallImpactSummary,
  CategoryImpactSummary,
  RecipientImpactSummary,
  MonthlyImpactSummary,
  ItemImpactSummary,
  LocationImpactSummary,
} from "./donation.repository.interface";
import { Donation } from "@/lib/models/donation";
import { DonationEntry } from "@/lib/models/donationEntry";
import { DonatedItem, UNCATEGORISED } from "@/lib/models/donatedItem";
import { HEALTH_IMPACT_TIER_COUNT, INTERNAL_RECIPIENT_TYPE, roundImpact } from "@/lib/models/impact";
import { roundCoordinate } from "@/lib/models/location";
import { User } from "@/lib/models/user";
import { DonationStatus } from "@/lib/models/donationStatus";
import { Prisma } from "@/generated/prisma/client";

const donationInclude = {
  entries: { include: { item: true } },
  recipient: true,
} satisfies Prisma.DonationInclude;

type DonationRow = Prisma.DonationGetPayload<{ include: typeof donationInclude }>;
type DonationEntryRow = DonationRow["entries"][number];

function toDonationStatus(raw: string): DonationStatus {
  const normalised = raw.toUpperCase();
  if (normalised === "COMPLETED" || normalised === "OPEN") {
    return normalised;
  }
  return "UNKNOWN";
}

function toDonation(row: DonationRow): Donation {
  return new Donation(
    row.id,
    row.createdAt.toISOString(),
    row.completedAt ? row.completedAt.toISOString() : null,
    row.desc,
    toDonationStatus(row.status),
    row.entries.map(
      (entry: DonationEntryRow) =>
        new DonationEntry(
          entry.id,
          new DonatedItem(
            entry.item.id,
            entry.item.name,
            entry.item.category,
            entry.item.sku,
            entry.item.unitsPerPack,
            entry.item.unitWeightKg,
            entry.item.co2eKgPerUnit,
            entry.item.healthImpactTier,
          ),
          entry.quantity,
        ),
    ),
    new User(
      row.recipient.id,
      row.recipient.name,
      row.recipient.contactName,
      row.recipient.email,
      row.recipient.street,
      row.recipient.city,
      row.recipient.state,
      row.recipient.zip,
      row.recipient.country,
      row.recipient.phone,
      row.recipient.lat,
      row.recipient.lng,
      row.recipient.type,
    ),
  );
}

type RawNumber = number | bigint | string;

function toNum(value: RawNumber): number {
  return typeof value === "number" ? value : Number(value);
}

interface ImpactTotalsRow {
  totalDonations: RawNumber;
  totalItems: RawNumber;
  totalUnitsDelivered: RawNumber;
  totalWeightDivertedKg: RawNumber;
  totalCO2eAvoidedKg: RawNumber;
  averageHealthImpactScore: RawNumber | null;
}

// Only completed donations to external recipients count towards impact figures, so status is
// not filterable here; limit and offset are ignored because aggregates are not paged
function impactSource(filters: DonationFilters = {}) {
  const { from, to, country, state } = filters;

  const conditions = [
    Prisma.sql`lower(d.status) = 'completed'`,
    Prisma.sql`u.type IS DISTINCT FROM ${INTERNAL_RECIPIENT_TYPE}`,
    ...(from ? [Prisma.sql`d."createdAt" >= ${from}`] : []),
    ...(to ? [Prisma.sql`d."createdAt" <= ${to}`] : []),
    ...(country ? [Prisma.sql`lower(u.country) = lower(${country})`] : []),
    ...(state ? [Prisma.sql`lower(u.state) = lower(${state})`] : []),
  ];

  return Prisma.sql`
    FROM "Donation" d
    JOIN "User" u ON u.id = d."recipientId"
    LEFT JOIN "DonationEntry" e ON e."donationId" = d.id
    LEFT JOIN "DonatedItem" i ON i.id = e."itemId"
    WHERE ${Prisma.join(conditions, " AND ")}
  `;
}

// Health score is the average item score (tier count + 1 - tier) weighted by quantity
const IMPACT_TOTALS = Prisma.sql`
  COUNT(DISTINCT d.id) AS "totalDonations",
  COALESCE(SUM(e.quantity), 0) AS "totalItems",
  COALESCE(SUM(e.quantity * i."unitsPerPack"), 0) AS "totalUnitsDelivered",
  COALESCE(SUM(e.quantity * i."unitsPerPack" * i."unitWeightKg"), 0) AS "totalWeightDivertedKg",
  COALESCE(SUM(e.quantity * i."unitsPerPack" * i."co2eKgPerUnit"), 0) AS "totalCO2eAvoidedKg",
  SUM(e.quantity * (${HEALTH_IMPACT_TIER_COUNT + 1}::int - i."healthImpactTier"))::float
    / NULLIF(SUM(e.quantity) FILTER (WHERE i."healthImpactTier" IS NOT NULL), 0) AS "averageHealthImpactScore"
`;

function toImpactTotals(row: ImpactTotalsRow) {
  return {
    totalDonations: toNum(row.totalDonations),
    totalItems: toNum(row.totalItems),
    totalUnitsDelivered: toNum(row.totalUnitsDelivered),
    totalWeightDivertedKg: roundImpact(toNum(row.totalWeightDivertedKg)),
    totalCO2eAvoidedKg: roundImpact(toNum(row.totalCO2eAvoidedKg)),
    averageHealthImpactScore:
      row.averageHealthImpactScore === null ? null : roundImpact(toNum(row.averageHealthImpactScore)),
  };
}

// limit and offset are deliberately ignored here so the same filter serves both the page and its total
function toDonationWhere(filters: DonationFilters): Prisma.DonationWhereInput {
  const { status, recipientId, from, to, country, state } = filters;

  return {
    ...(status ? { status: { equals: status, mode: "insensitive" } } : {}),
    ...(recipientId ? { recipientId } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {}),
    ...(country || state
      ? {
          recipient: {
            ...(country ? { country: { equals: country, mode: "insensitive" } } : {}),
            ...(state ? { state: { equals: state, mode: "insensitive" } } : {}),
          },
        }
      : {}),
  };
}

// "Top donated resources" shows this many items unless a caller asks for a different number
const TOP_ITEMS_LIMIT = 10;

export class DonationRepository implements IDonationRepository {
  async getAll(filters: DonationFilters = {}): Promise<Donation[]> {
    const { limit, offset } = filters;

    const rows = await prisma.donation.findMany({
      where: toDonationWhere(filters),
      include: donationInclude,
      orderBy: { createdAt: "desc" },
      ...(limit !== undefined ? { take: limit } : {}),
      ...(offset !== undefined ? { skip: offset } : {}),
    });
    return rows.map(toDonation);
  }

  async count(filters: DonationFilters = {}): Promise<number> {
    return prisma.donation.count({ where: toDonationWhere(filters) });
  }

  async getById(id: string): Promise<Donation | null> {
    const row = await prisma.donation.findUnique({ where: { id }, include: donationInclude });
    return row ? toDonation(row) : null;
  }

  async getOverallImpactSummary(filters: DonationFilters = {}): Promise<OverallImpactSummary> {
    const rows = await prisma.$queryRaw<ImpactTotalsRow[]>`
      SELECT ${IMPACT_TOTALS}
      ${impactSource(filters)}
    `;
    return toImpactTotals(rows[0]);
  }

  async getImpactByCategory(filters: DonationFilters = {}): Promise<CategoryImpactSummary[]> {
    const rows = await prisma.$queryRaw<(ImpactTotalsRow & { category: string })[]>`
      SELECT
        COALESCE(i.category, ${UNCATEGORISED}) AS category,
        ${IMPACT_TOTALS}
      ${impactSource(filters)} AND e.id IS NOT NULL
      GROUP BY i.category
    `;
    return rows.map((row) => ({ category: row.category, ...toImpactTotals(row) }));
  }

  async getImpactByRecipient(filters: DonationFilters = {}): Promise<RecipientImpactSummary[]> {
    const rows = await prisma.$queryRaw<(ImpactTotalsRow & { recipientId: string; organisation: string })[]>`
      SELECT
        d."recipientId" AS "recipientId",
        u.name AS "organisation",
        ${IMPACT_TOTALS}
      ${impactSource(filters)}
      GROUP BY d."recipientId", u.name
    `;
    return rows.map((row) => ({
      recipientId: row.recipientId,
      organisation: row.organisation,
      ...toImpactTotals(row),
    }));
  }

  async getImpactByMonth(filters: DonationFilters = {}): Promise<MonthlyImpactSummary[]> {
    const rows = await prisma.$queryRaw<(ImpactTotalsRow & { month: string })[]>`
      SELECT
        to_char(d."createdAt", 'YYYY-MM') AS "month",
        ${IMPACT_TOTALS}
      ${impactSource(filters)}
      GROUP BY 1
      ORDER BY 1
    `;
    return rows.map((row) => ({ month: row.month, ...toImpactTotals(row) }));
  }


  async getImpactByItem(filters: DonationFilters = {}, limit = TOP_ITEMS_LIMIT): Promise<ItemImpactSummary[]> {
    const rows = await prisma.$queryRaw<
      (ImpactTotalsRow & { itemId: string; name: string; sku: string | null; category: string })[]
    >`
      SELECT
        i.id AS "itemId",
        i.name AS "name",
        i.sku AS "sku",
        COALESCE(i.category, ${UNCATEGORISED}) AS category,
        ${IMPACT_TOTALS}
      ${impactSource(filters)} AND e.id IS NOT NULL
      GROUP BY i.id, i.name, i.sku, i.category
      ORDER BY "totalItems" DESC, i.name
      LIMIT ${limit}
    `;
    return rows.map((row) => ({
      itemId: row.itemId,
      name: row.name,
      sku: row.sku,
      category: row.category,
      ...toImpactTotals(row),
    }));
  }

  // One row per suburb + state; the pin sits at the average of its recipients' coordinates.
  // Orders with no known destination still count in the totals but have no place to show here
  async getImpactByLocation(filters: DonationFilters = {}): Promise<LocationImpactSummary[]> {
    const rows = await prisma.$queryRaw<
      (ImpactTotalsRow & { city: string | null; state: string | null; lat: number | null; lng: number | null })[]
    >`
      SELECT
        u.city AS "city",
        u.state AS "state",
        AVG(u.lat) AS "lat",
        AVG(u.lng) AS "lng",
        ${IMPACT_TOTALS}
      ${impactSource(filters)} AND u.city IS NOT NULL
      GROUP BY u.city, u.state
      ORDER BY "totalDonations" DESC, "totalItems" DESC, u.city
    `;
    return rows.map((row) => ({
      city: row.city,
      state: row.state,
      lat: roundCoordinate(row.lat),
      lng: roundCoordinate(row.lng),
      ...toImpactTotals(row),
    }));
  }
}
