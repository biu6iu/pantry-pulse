import { DonationStatus } from "@/lib/models/donationStatus";

export interface DonationDTO {
  id: string;
  dateCreated: string;
  dateCompleted: string | null;
  description: string | null;
  status: DonationStatus;

  receiver: {
    id: string;
    organisation: string;
  };

  items: {
    itemName: string;
    category: string;
    quantity: number;
  }[];

  healthImpact: {
    itemsDelivered: number; 
    score: number; 
  } | null;

  environmentalImpact: {
    estimatedCO2Saved: number;
    score: number;
  } | null;
}