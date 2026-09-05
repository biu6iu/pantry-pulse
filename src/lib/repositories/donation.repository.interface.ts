import { Donation } from "@/lib/models/donation";

export interface OverallImpactSummary {
  totalDonations: number;
  totalItems: number;
  totalHealthImpactScore: number;
  totalEnvironmentalImpactScore: number;
  totalCO2Saved: number;
}

export interface CategoryImpactSummary {
  category: string;
  totalItems: number;
  totalHealthImpactScore: number;
}

export interface RecipientImpactSummary {
  recipientId: string;
  organisation: string;
  totalDonations: number;
  totalItems: number;
  totalHealthImpactScore: number;
  totalEnvironmentalImpactScore: number;
  totalCO2Saved: number;
}

export interface MonthlyImpactSummary {
  month: string; // "YYYY-MM"
  totalDonations: number;
  totalItems: number;
  totalHealthImpactScore: number;
  totalEnvironmentalImpactScore: number;
}

export interface IDonationRepository {
  getAll(): Promise<Donation[]>;
  getById(id: string): Promise<Donation | null>;
  getOverallImpactSummary(): Promise<OverallImpactSummary>;
  getImpactByCategory(): Promise<CategoryImpactSummary[]>;
  getImpactByRecipient(): Promise<RecipientImpactSummary[]>;
  getImpactByMonth(): Promise<MonthlyImpactSummary[]>;
}