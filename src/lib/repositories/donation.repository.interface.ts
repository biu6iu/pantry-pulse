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

export interface IDonationRepository {
  getAll(): Promise<Donation[]>;
  getById(id: string): Promise<Donation | null>;
  getOverallImpactSummary(): Promise<OverallImpactSummary>;
  getImpactByCategory(): Promise<CategoryImpactSummary[]>;
  getImpactByRecipient(): Promise<RecipientImpactSummary[]>;
  getImpactByMonth(): Promise<MonthlyImpactSummary[]>;
}