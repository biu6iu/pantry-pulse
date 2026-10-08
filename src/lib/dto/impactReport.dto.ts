export interface ImpactTotals {
  totalDonations: number;
  totalItems: number;
  totalUnitsDelivered: number;
  totalWeightDivertedKg: number;
  totalCO2eAvoidedKg: number;
  averageHealthImpactScore: number | null; // null when no item in the group has a health impact tier
}

export type OverallImpactSummary = ImpactTotals;

export interface CategoryImpactSummary extends ImpactTotals {
  category: string;
}

export interface RecipientImpactSummary extends ImpactTotals {
  recipientId: string;
  organisation: string;
}

export interface MonthlyImpactSummary extends ImpactTotals {
  month: string; // "YYYY-MM"
}

export interface ImpactReportDTO {
  overall: OverallImpactSummary;
  byCategory: CategoryImpactSummary[];
  byRecipient: RecipientImpactSummary[];
  byMonth: MonthlyImpactSummary[];
}

export interface ItemImpactSummary extends ImpactTotals {
  itemId: string;
  name: string;
  sku: string | null;
  category: string;
}