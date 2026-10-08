export interface ImpactTotals {
  totalDonations: number;
  totalItems: number;
  totalUnitsDelivered: number;
  totalWeightDivertedKg: number;
  totalCO2eAvoidedKg: number;
  averageHealthImpactScore: number | null; // null when no item in the group has a health impact tier
}

export interface OverallImpactSummary extends ImpactTotals {
  locationsReached: number; // distinct suburb + state pairs with a known destination, i.e. the rows of byLocation
}

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
  byItem: ItemImpactSummary[];
  byLocation: LocationImpactSummary[];
}

export interface ItemImpactSummary extends ImpactTotals {
  itemId: string;
  name: string;
  sku: string | null;
  category: string;
}

export interface LocationImpactSummary extends ImpactTotals {
  city: string | null;
  state: string | null;
  lat: number | null; // rounded to ~1.1km, see models/location.ts
  lng: number | null;
}