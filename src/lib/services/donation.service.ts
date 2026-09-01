import { IDonationRepository } from "@/lib/repositories/donation.repository.interface";
import { Donation } from "@/lib/models/donation";
import { DonationDTO } from "@/lib/dto/donation.dto";
import { DonationItemDTO } from "@/lib/dto/donationItem.dto";

function toDonationItemDTO(donation: Donation): DonationItemDTO {
  return {
    id: donation.id,
    dateCreated: donation.createdAt,
    description: donation.desc,
    status: donation.status,
    receiverOrganisation: donation.recipientOrganisation,
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
      id: donation.recipientId,
      organisation: donation.recipientOrganisation,
    },
    items: donation.entries.map((entry) => ({
      itemName: entry.itemName,
      category: entry.itemCategory ?? "Uncategorised",
      quantity: entry.quantity,
    })),
    healthImpact:
      totalHealthImpactScore === null
        ? null
        : { itemsDelivered: donation.getTotalItems(), score: totalHealthImpactScore },
    environmentalImpact: donation.environmentalImpact
      ? { estimatedCO2Saved: donation.environmentalImpact.co2Saved, score: donation.environmentalImpact.score }
      : null,
  };
}

export class DonationService {
  constructor(private readonly repo: IDonationRepository) {}

  async listDonations(): Promise<DonationItemDTO[]> {
    const donations = await this.repo.getAll();
    return donations.map(toDonationItemDTO);
  }

  async getDonationDetail(id: string): Promise<DonationDTO | null> {
    const donation = await this.repo.getById(id);
    return donation ? toDonationDTO(donation) : null;
  }
}
