export interface ImpactReportDTO {
  overall: {
    totalDonations: number;
    totalItems: number;
    totalHealthImpactScore: number;
    totalEnvironmentalImpactScore: number;
    totalCO2Saved: number;
  };

  byCategory: {
    category: string;
    totalItems: number;
    totalHealthImpactScore: number;
  }[];

  byRecipient: {
    recipientId: string;
    organisation: string;
    totalDonations: number;
    totalItems: number;
    totalHealthImpactScore: number;
    totalEnvironmentalImpactScore: number;
    totalCO2Saved: number;
  }[];

  byMonth: {
    month: string;
    totalDonations: number;
    totalItems: number;
    totalHealthImpactScore: number;
    totalEnvironmentalImpactScore: number;
  }[];
}