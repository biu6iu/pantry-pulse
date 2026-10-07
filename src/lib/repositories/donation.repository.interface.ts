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
  getOverallImpactSummary(filters?: DonationFilters): Promise<OverallImpactSummary>;
  getImpactByCategory(filters?: DonationFilters): Promise<CategoryImpactSummary[]>;
  getImpactByRecipient(filters?: DonationFilters): Promise<RecipientImpactSummary[]>;
  getImpactByMonth(filters?: DonationFilters): Promise<MonthlyImpactSummary[]>;
}