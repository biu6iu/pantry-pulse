import { DonationStatus } from "@/lib/models/donationStatus";

export interface DonationSummaryDTO {
  id: string;
  dateCreated: string;
  dateCompleted: string | null;
  description: string | null;
  status: DonationStatus;

  receiver: {
    id: string;
    organisation: string;
    // enough to say where an order went and to what kind of recipient without naming them
    city: string | null;
    state: string | null;
    type: string | null; // e.g. "wildlife_rescue"
  };

  totalItems: number;
  healthImpactScore: number | null;
  weightDivertedKg: number | null;
  co2eAvoidedKg: number | null;
}

export interface DonationListDTO {
  items: DonationSummaryDTO[];
  total: number;
}
