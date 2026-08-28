// Interface defining the contract for donation repositories
import { Donation } from "@/lib/models/donation";

export interface IDonationRepository {
  getAll(): Promise<Donation[]>;
  getById(id: string): Promise<Donation | null>;
}
