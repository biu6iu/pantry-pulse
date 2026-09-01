import { DonationStatus } from "@/lib/models/donationStatus";

export interface DonationItemDTO {
  id: string;
  dateCreated: string;
  description: string | null;
  status: DonationStatus;
  receiverOrganisation: string; 
  totalItems: number;
  healthImpactScore: number | null;
  environmentalImpactScore: number | null;
}