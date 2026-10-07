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
