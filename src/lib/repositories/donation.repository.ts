// implementation of the donation repository
import { prisma } from "@/lib/config/db";
import { IDonationRepository } from "./donation.repository.interface";
import { Donation } from "@/lib/models/donation";
import { DonationEntry } from "@/lib/models/donationEntry";
import { DonationStatus } from "@/lib/models/donationStatus";
import type { Donation as PrismaDonation, DonationEntry as PrismaDonationEntry } from "@/generated/prisma/client";

type DonationRow = PrismaDonation & { entries: PrismaDonationEntry[] };

function toDonationStatus(raw: string): DonationStatus {
  const normalized = raw.toUpperCase();
  return normalized === "COMPLETED" || normalized === "OPEN" ? normalized : null;
}

function toDonation(row: DonationRow): Donation {
  return new Donation(
    row.id,
    row.createdAt.toISOString(),
    row.completedAt ? row.completedAt.toISOString() : null,
    row.notes,
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
}