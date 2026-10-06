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
  limit?: number;
  offset?: number;
}

export interface IDonationRepository {
  getAll(filters?: DonationFilters): Promise<Donation[]>;
  count(filters?: DonationFilters): Promise<number>;
  getById(id: string): Promise<Donation | null>;
  getOverallImpactSummary(): Promise<OverallImpactSummary>;
  getImpactByCategory(): Promise<CategoryImpactSummary[]>;
  getImpactByRecipient(): Promise<RecipientImpactSummary[]>;
  getImpactByMonth(): Promise<MonthlyImpactSummary[]>;
}