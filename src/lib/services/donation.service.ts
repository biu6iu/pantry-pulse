import { IDonationRepository } from "@/lib/repositories/donation.repository.interface";
import { Donation } from "@/lib/models/donation";
import { UNCATEGORISED } from "@/lib/models/donatedItem";
import { DonationDTO } from "@/lib/dto/donation.dto";
import { DonationSummaryDTO } from "@/lib/dto/donationSummary.dto";

function toDonationSummaryDTO(donation: Donation): DonationSummaryDTO {
  return {
    id: donation.id,
    dateCreated: donation.createdAt,
    dateCompleted: donation.completedAt,
    description: donation.desc,
    status: donation.status,
    receiver: {
      id: donation.recipient.id,
      organisation: donation.recipient.organisation,
    },
    totalItems: donation.getTotalItems(),
    healthImpactScore: donation.getTotalHealthImpactScore(),
    environmentalImpactScore: donation.environmentalImpact?.score ?? null,
  };
}

function toDonationDTO(donation: Donation): DonationDTO {
  const totalHealthImpactScore = donation.getTotalHealthImpactScore();

  return {
    id: donation.id,
    dateCreated: donation.createdAt,
    dateCompleted: donation.completedAt,
    description: donation.desc,
    status: donation.status,
    receiver: {
      id: donation.recipient.id,
      organisation: donation.recipient.organisation,
    },
    items: donation.entries.map((entry) => ({
      entryId: entry.id,
      itemId: entry.item.id,
      itemName: entry.item.name,
      category: entry.item.category ?? UNCATEGORISED,
      quantity: entry.quantity,
    })),
    healthImpact: totalHealthImpactScore === null ? null : { score: totalHealthImpactScore },
    environmentalImpact: donation.environmentalImpact
      ? { estimatedCO2Saved: donation.environmentalImpact.co2Saved, score: donation.environmentalImpact.score }
      : null,
    totalItems: donation.getTotalItems(),
  };
}

export class DonationService {
  constructor(private readonly repo: IDonationRepository) {}

  async listDonations(): Promise<DonationSummaryDTO[]> {
    const donations = await this.repo.getAll();
    return donations.map(toDonationSummaryDTO);
  }

  async getDonationDetail(id: string): Promise<DonationDTO | null> {
    const donation = await this.repo.getById(id);
    return donation ? toDonationDTO(donation) : null;
  }
}
