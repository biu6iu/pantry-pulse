interface DonationItemDTO {
  id: string;
  dateCreated: string;
  description: string | null; 
  status: "COMPLETED" | "OPEN" | null;
  receiverOrganisation: string; 
  totalItems: number;
  healthImpactScore: number | null;
  environmentalImpactScore: number | null;
}