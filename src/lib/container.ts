import { DonationRepository } from "@/lib/repositories/donation.repository";
import { DonationService } from "@/lib/services/donation.service";
import { ImpactService } from "@/lib/services/impact.service";

const donationRepository = new DonationRepository();

export const donationService = new DonationService(donationRepository);
export const impactService = new ImpactService(donationRepository);