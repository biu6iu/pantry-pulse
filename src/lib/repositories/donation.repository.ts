import { prisma } from "@/lib/config/db";
import {
  IDonationRepository,
  OverallImpactSummary,
  CategoryImpactSummary,
  RecipientImpactSummary,
  MonthlyImpactSummary,
} from "./donation.repository.interface";
import { Donation } from "@/lib/models/donation";
import { DonationEntry } from "@/lib/models/donationEntry";
import { DonatedItem } from "@/lib/models/donatedItem";
import { HealthImpact } from "@/lib/models/healthImpact";
import { EnvironmentalImpact } from "@/lib/models/environmentalImpact";
import { User } from "@/lib/models/user";
import { DonationStatus } from "@/lib/models/donationStatus";
import { Prisma } from "@/generated/prisma/client";

const donationInclude = {
  entries: { include: { item: true, healthImpact: true } },
  environmentalImpact: true,
  recipient: true,
} satisfies Prisma.DonationInclude;

type DonationRow = Prisma.DonationGetPayload<{ include: typeof donationInclude }>;
type DonationEntryRow = DonationRow["entries"][number];

function toDonationStatus(raw: string): DonationStatus {
  const normalized = raw.toUpperCase();
  if (normalized === "COMPLETED" || normalized === "OPEN") {
    return normalized;
  }
  return null;
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
          new DonatedItem(entry.item.id, entry.item.name, entry.item.category, entry.item.sku),
          entry.quantity,
          entry.healthImpact
            ? new HealthImpact(entry.healthImpact.id, entry.healthImpact.score, entry.healthImpact.donationEntryId)
            : null,
        ),
    ),
    new User(
      row.recipient.id,
      row.recipient.name,
      row.recipient.contactName,
      row.recipient.email,
      row.recipient.street,
      row.recipient.city,
      row.recipient.province,
      row.recipient.zip,
      row.recipient.country,
      row.recipient.phone,
    ),
    row.environmentalImpact
      ? new EnvironmentalImpact(
          row.environmentalImpact.id,
          row.environmentalImpact.score,
          row.environmentalImpact.donationId,
          row.environmentalImpact.co2Saved,
        )
      : null,
  );
}

function toNum(value: number | bigint): number {
  return typeof value === "bigint" ? Number(value) : value;
}


export class DonationRepository implements IDonationRepository {
  async getAll(): Promise<Donation[]> {
    const rows = await prisma.donation.findMany({ include: donationInclude });
    return rows.map(toDonation);
  }

  async getById(id: string): Promise<Donation | null> {
    const row = await prisma.donation.findUnique({ where: { id }, include: donationInclude });
    return row ? toDonation(row) : null;
  }

  async getOverallImpactSummary(): Promise<OverallImpactSummary> {
    const [totalDonations, itemAgg, healthAgg, envAgg] = await Promise.all([
      prisma.donation.count(),
      prisma.donationEntry.aggregate({ _sum: { quantity: true } }),
      prisma.healthImpact.aggregate({ _sum: { score: true } }),
      prisma.environmentalImpact.aggregate({ _sum: { score: true, co2Saved: true } }),
    ]);

    return {
      totalDonations,
      totalItems: itemAgg._sum.quantity ?? 0,
      totalHealthImpactScore: healthAgg._sum.score ?? 0,
      totalEnvironmentalImpactScore: envAgg._sum.score ?? 0,
      totalCO2Saved: envAgg._sum.co2Saved ?? 0,
    };
  }

  async getImpactByCategory(): Promise<CategoryImpactSummary[]> {
    const rows = await prisma.$queryRaw<CategoryImpactSummary[]>`
      SELECT
        COALESCE(i.category, 'Uncategorised') AS category,
        COALESCE(SUM(e.quantity), 0) AS "totalItems",
        COALESCE(SUM(h.score), 0) AS "totalHealthImpactScore"
      FROM "DonationEntry" e
      JOIN "DonatedItem" i ON i.id = e."itemId"
      LEFT JOIN "HealthImpact" h ON h."donationEntryId" = e.id
      GROUP BY COALESCE(i.category, 'Uncategorised')
    `;
    return rows.map((row) => ({
      category: row.category,
      totalItems: toNum(row.totalItems),
      totalHealthImpactScore: toNum(row.totalHealthImpactScore),
    }));
  }

  async getImpactByRecipient(): Promise<RecipientImpactSummary[]> {
    const rows = await prisma.$queryRaw<RecipientImpactSummary[]>`
      SELECT
        d."recipientId" AS "recipientId",
        u.name AS "organisation",
        COUNT(*) AS "totalDonations",
        COALESCE(SUM(dt."itemCount"), 0) AS "totalItems",
        COALESCE(SUM(dt."healthScore"), 0) AS "totalHealthImpactScore",
        COALESCE(SUM(env.score), 0) AS "totalEnvironmentalImpactScore",
        COALESCE(SUM(env."co2Saved"), 0) AS "totalCO2Saved"
      FROM "Donation" d
      JOIN "User" u ON u.id = d."recipientId"
      LEFT JOIN (
        SELECT
          e."donationId" AS "donationId",
          SUM(e.quantity) AS "itemCount",
          SUM(h.score) AS "healthScore"
        FROM "DonationEntry" e
        LEFT JOIN "HealthImpact" h ON h."donationEntryId" = e.id
        GROUP BY e."donationId"
      ) dt ON dt."donationId" = d.id
      LEFT JOIN "EnvironmentalImpact" env ON env."donationId" = d.id
      GROUP BY d."recipientId", u.name
    `;
    return rows.map((row) => ({
      recipientId: row.recipientId,
      organisation: row.organisation,
      totalDonations: toNum(row.totalDonations),
      totalItems: toNum(row.totalItems),
      totalHealthImpactScore: toNum(row.totalHealthImpactScore),
      totalEnvironmentalImpactScore: toNum(row.totalEnvironmentalImpactScore),
      totalCO2Saved: toNum(row.totalCO2Saved),
    }));
  }

  async getImpactByMonth(): Promise<MonthlyImpactSummary[]> {
    const rows = await prisma.$queryRaw<MonthlyImpactSummary[]>`
      SELECT
        strftime('%Y-%m', d."createdAt") AS "month",
        COUNT(*) AS "totalDonations",
        COALESCE(SUM(dt."itemCount"), 0) AS "totalItems",
        COALESCE(SUM(dt."healthScore"), 0) AS "totalHealthImpactScore",
        COALESCE(SUM(env.score), 0) AS "totalEnvironmentalImpactScore"
      FROM "Donation" d
      LEFT JOIN (
        SELECT
          e."donationId" AS "donationId",
          SUM(e.quantity) AS "itemCount",
          SUM(h.score) AS "healthScore"
        FROM "DonationEntry" e
        LEFT JOIN "HealthImpact" h ON h."donationEntryId" = e.id
        GROUP BY e."donationId"
      ) dt ON dt."donationId" = d.id
      LEFT JOIN "EnvironmentalImpact" env ON env."donationId" = d.id
      GROUP BY "month"
      ORDER BY "month"
    `;
    return rows.map((row) => ({
      month: row.month,
      totalDonations: toNum(row.totalDonations),
      totalItems: toNum(row.totalItems),
      totalHealthImpactScore: toNum(row.totalHealthImpactScore),
      totalEnvironmentalImpactScore: toNum(row.totalEnvironmentalImpactScore),
    }));
  }
}