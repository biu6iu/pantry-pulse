import { Donation } from "@/lib/models/donation";
import type { DonationFilters } from "@/lib/dto/donationFilters.dto";
import {
  OverallImpactSummary,
  CategoryImpactSummary,
  RecipientImpactSummary,
  MonthlyImpactSummary,
  ItemImpactSummary,
  LocationImpactSummary,
  HealthImpactScoreSummary,
} from "@/lib/dto/impactReport.dto";

export type {
  OverallImpactSummary,
  CategoryImpactSummary,
  RecipientImpactSummary,
  MonthlyImpactSummary,
  ItemImpactSummary,
  LocationImpactSummary,
  HealthImpactScoreSummary,
};

export type { DonationFilters };

export interface IDonationRepository {
  getAll(filters?: DonationFilters): Promise<Donation[]>;
  count(filters?: DonationFilters): Promise<number>;
  getCountries(): Promise<string[]>;
  getRegions(): Promise<Record<string, string[]>>;
  getById(id: string): Promise<Donation | null>;
  getOverallImpactSummary(filters?: DonationFilters): Promise<OverallImpactSummary>;
  getImpactByCategory(filters?: DonationFilters): Promise<CategoryImpactSummary[]>;
  getImpactByRecipient(filters?: DonationFilters): Promise<RecipientImpactSummary[]>;
  getImpactByMonth(filters?: DonationFilters): Promise<MonthlyImpactSummary[]>;
  getImpactByItem(filters?: DonationFilters, limit?: number): Promise<ItemImpactSummary[]>;
  getImpactByLocation(filters?: DonationFilters): Promise<LocationImpactSummary[]>;
  getImpactByHealthImpactScore(filters?: DonationFilters): Promise<HealthImpactScoreSummary[]>;
}