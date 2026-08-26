interface DonationDTO {
  id: string;
  dateCreated: string;
  description: string;
  status: "PENDING" | "COLLECTED" | "IN_TRANSIT" | "DELIVERED";
  
  sender: {
    id: string;
    organisation: string;
  };
  receiver: {
    id: string;
    organisation: string;
  };

  items: {
    itemName: string;
    category: string;
    quantity: number;
  }[];

  tracking: {
    origin: string;
    destination: string;
    timeSent: string | null;
    eta: string | null;
    received: string | null;
  } | null;

  healthImpact: {
    itemsDelivered: number;
    category: string;
    score: number;
  } | null;

  environmentalImpact: {
    estimatedCO2Saved: number;
    score: number;
  } | null;
}