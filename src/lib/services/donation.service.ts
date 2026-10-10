import { IDonationRepository, DonationFilters } from "@/lib/repositories/donation.repository.interface";
import { Donation } from "@/lib/models/donation";
import { UNCATEGORISED } from "@/lib/models/donatedItem";
import { EnvironmentalImpact, roundImpact } from "@/lib/models/impact";
import { DonationDTO } from "@/lib/dto/donation.dto";
import { DonationListDTO, DonationSummaryDTO } from "@/lib/dto/donationSummary.dto";

function toHealthImpactScore(donation: Donation): number | null {
  const score = donation.getHealthImpactScore();
  return score === null ? null : roundImpact(score);
}

function toEnvironmentalImpact(donation: Donation): EnvironmentalImpact | null {
  const impact = donation.getEnvironmentalImpact();
  if (impact === null) return null;
  return {
    unitsDelivered: impact.unitsDelivered,
    weightDivertedKg: roundImpact(impact.weightDivertedKg),
    co2eAvoidedKg: roundImpact(impact.co2eAvoidedKg),
  };
}

function toDonationSummaryDTO(donation: Donation): DonationSummaryDTO {
  const environmentalImpact = toEnvironmentalImpact(donation);

  return {
    id: donation.id,
    dateCreated: donation.createdAt,
    dateCompleted: donation.completedAt,
    description: donation.desc,
    status: donation.status,
    receiver: {
      id: donation.recipient.id,
      organisation: donation.recipient.organisation,
      city: donation.recipient.city,
      state: donation.recipient.state,
      type: donation.recipient.type,
    },
    totalItems: donation.getTotalItems(),
    healthImpactScore: toHealthImpactScore(donation),
    weightDivertedKg: environmentalImpact?.weightDivertedKg ?? null,
    co2eAvoidedKg: environmentalImpact?.co2eAvoidedKg ?? null,
  };
}

function toDonationDTO(donation: Donation): DonationDTO {
  const healthImpactScore = toHealthImpactScore(donation);

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
    healthImpact: healthImpactScore === null ? null : { score: healthImpactScore },
    environmentalImpact: toEnvironmentalImpact(donation),
    totalItems: donation.getTotalItems(),
  };
}

export class DonationService {
  constructor(private readonly repo: IDonationRepository) {}

  async listDonations(filters?: DonationFilters): Promise<DonationListDTO> {
    const [donations, total] = await Promise.all([this.repo.getAll(filters), this.repo.count(filters)]);
    return { items: donations.map(toDonationSummaryDTO), total };
  }

  async getDonationDetail(id: string): Promise<DonationDTO | null> {
    const donation = await this.repo.getById(id);
    return donation ? toDonationDTO(donation) : null;
  }
}
