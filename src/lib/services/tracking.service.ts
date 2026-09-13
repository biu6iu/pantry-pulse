import { IDonationRepository } from "@/lib/repositories/donation.repository.interface";
import { Donation } from "@/lib/models/donation";
import { ORIGIN } from "@/lib/config/origin";
import { TrackingDTO, TrackingStageDTO } from "@/lib/dto/tracking.dto";

function toTrackingDTO(donation: Donation): TrackingDTO {
  const completed = donation.status === "COMPLETED";

  const timeline: TrackingStageDTO[] = [
    { stage: "CREATED", label: "Created", occurredAt: donation.createdAt, complete: true },
    { stage: "COMPLETED", label: "Completed", occurredAt: donation.completedAt, complete: completed },
  ];

  return {
    id: donation.id,
    status: donation.status,
    origin: ORIGIN,
    receiver: {
      id: donation.recipient.id,
      organisation: donation.recipient.organisation,
      contactName: donation.recipient.contactName,
      city: donation.recipient.city,
      state: donation.recipient.state,
      country: donation.recipient.country,
      lat: donation.recipient.lat,
      lng: donation.recipient.lng,
    },
    timeline,
  };
}

export class TrackingService {
  constructor(private readonly repo: IDonationRepository) {}

  async getTracking(id: string): Promise<TrackingDTO | null> {
    const donation = await this.repo.getById(id);
    return donation ? toTrackingDTO(donation) : null;
  }
}
