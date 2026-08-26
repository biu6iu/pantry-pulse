interface DonationItemDTO {
  id: string;
  dateCreated: string;       
  description: string;
  status: "PENDING" | "COLLECTED" | "IN_TRANSIT" | "DELIVERED";
  senderOrganisation: string;
  receiverOrganisation: string;
  totalItems: number;
  healthImpactScore: number | null;
  environmentalImpactScore: number | null;
}