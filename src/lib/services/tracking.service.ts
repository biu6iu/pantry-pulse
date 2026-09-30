import { IDonationRepository } from "@/lib/repositories/donation.repository.interface";
import { Donation } from "@/lib/models/donation";
import { ORIGIN } from "@/lib/config/origin";
import { TrackingDTO, TrackingStageDTO } from "@/lib/dto/tracking.dto";

// rounds to ~1.1km precision so recipients exact street addresses aren't derivable from order tracking data
const COORDINATE_PRECISION = 2;

function roundCoordinate(value: number | null): number | null {
  if (value === null) return null;
  return Number(value.toFixed(COORDINATE_PRECISION));
}

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
      city: donation.recipient.city,
      state: donation.recipient.state,
      country: donation.recipient.country,
      lat: roundCoordinate(donation.recipient.lat),
      lng: roundCoordinate(donation.recipient.lng),
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
