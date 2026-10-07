import { Donation } from "@/lib/models/donation";
import {
  OverallImpactSummary,
  CategoryImpactSummary,
  RecipientImpactSummary,
  MonthlyImpactSummary,
} from "@/lib/dto/impactReport.dto";

export type {
  OverallImpactSummary,
  CategoryImpactSummary,
  RecipientImpactSummary,
  MonthlyImpactSummary,
};

export interface DonationFilters {
  status?: "OPEN" | "COMPLETED";
  recipientId?: string;
  from?: Date;
  to?: Date;
  country?: string;
  state?: string;
  limit?: number;
  offset?: number;
}

export interface IDonationRepository {
  getAll(filters?: DonationFilters): Promise<Donation[]>;
  getById(id: string): Promise<Donation | null>;
  getOverallImpactSummary(filters?: DonationFilters): Promise<OverallImpactSummary>;
  getImpactByCategory(filters?: DonationFilters): Promise<CategoryImpactSummary[]>;
  getImpactByRecipient(filters?: DonationFilters): Promise<RecipientImpactSummary[]>;
  getImpactByMonth(filters?: DonationFilters): Promise<MonthlyImpactSummary[]>;
}