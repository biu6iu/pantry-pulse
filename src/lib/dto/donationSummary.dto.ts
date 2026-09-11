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
  environmentalImpactScore: number | null;
}