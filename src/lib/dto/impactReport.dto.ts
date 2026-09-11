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

export interface ImpactReportDTO {
  overall: OverallImpactSummary;
  byCategory: CategoryImpactSummary[];
  byRecipient: RecipientImpactSummary[];
  byMonth: MonthlyImpactSummary[];
}
