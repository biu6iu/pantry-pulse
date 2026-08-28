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
import { DonationStatus } from "@/lib/models/donationStatus";
import type { Donation as PrismaDonation, DonationEntry as PrismaDonationEntry } from "@/generated/prisma/client";

type DonationRow = PrismaDonation & { entries: PrismaDonationEntry[] };

function toDonationStatus(raw: string): DonationStatus {
  const normalized = raw.toUpperCase();
  if (normalized === "COMPLETED" || normalized === "OPEN") {
    return normalized;
  }
  console.warn(`Unexpected donation status encountered: "${raw}"`);
  return null;
}

function toDonation(row: DonationRow): Donation {
  return new Donation(
    row.id,
    row.createdAt.toISOString(),
    row.completedAt ? row.completedAt.toISOString() : null,
    row.desc,
    toDonationStatus(row.status),
    row.entries.map((entry: PrismaDonationEntry) => new DonationEntry(entry.id, entry.itemId, entry.quantity)),
    row.recipientId,
  );
}

export class DonationRepository implements IDonationRepository {
  async getAll(): Promise<Donation[]> {
    const rows = await prisma.donation.findMany({ include: { entries: true } });
    return rows.map(toDonation);
  }

  async getById(id: string): Promise<Donation | null> {
    const row = await prisma.donation.findUnique({ where: { id }, include: { entries: true } });
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
    return prisma.$queryRaw<CategoryImpactSummary[]>`
      SELECT
        COALESCE(i.category, 'Uncategorised') AS category,
        COALESCE(SUM(e.quantity), 0) AS "totalItems",
        COALESCE(SUM(h.score), 0) AS "totalHealthImpactScore"
      FROM "DonationEntry" e
      JOIN "DonatedItem" i ON i.id = e."itemId"
      LEFT JOIN "HealthImpact" h ON h."donationEntryId" = e.id
      GROUP BY COALESCE(i.category, 'Uncategorised')
    `;
  }

  async getImpactByRecipient(): Promise<RecipientImpactSummary[]> {
    return prisma.$queryRaw<RecipientImpactSummary[]>`
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
  }

  async getImpactByMonth(): Promise<MonthlyImpactSummary[]> {
    return prisma.$queryRaw<MonthlyImpactSummary[]>`
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
  }
}