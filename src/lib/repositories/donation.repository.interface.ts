import { Donation } from "@/lib/models/donation";
import type { DonationFilters } from "@/lib/dto/donationFilters.dto";
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

export type { DonationFilters };

export interface IDonationRepository {
  getAll(filters?: DonationFilters): Promise<Donation[]>;
  count(filters?: DonationFilters): Promise<number>;
  getById(id: string): Promise<Donation | null>;
  getOverallImpactSummary(): Promise<OverallImpactSummary>;
  getImpactByCategory(): Promise<CategoryImpactSummary[]>;
  getImpactByRecipient(): Promise<RecipientImpactSummary[]>;
  getImpactByMonth(): Promise<MonthlyImpactSummary[]>;
}