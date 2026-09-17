import { apiRequest } from "./http";
import type { ImpactReportDTO } from "@/lib/dto/impactReport.dto";
import type { DonationDTO } from "@/lib/dto/donation.dto";
import type { DonationSummaryDTO } from "@/lib/dto/donationSummary.dto";
import type { TrackingDTO } from "@/lib/dto/tracking.dto";

export async function getImpactReport(): Promise<ImpactReportDTO | null> {
  return apiRequest<ImpactReportDTO>("/api/impact");
}

export async function listDonations(): Promise<DonationSummaryDTO[] | null> {
  return apiRequest<DonationSummaryDTO[]>("/api/donations");
}

export async function getDonation(id: string): Promise<DonationDTO | null> {
  return apiRequest<DonationDTO>(`/api/donations/${encodeURIComponent(id)}`);
}

export async function getTracking(id: string): Promise<TrackingDTO | null> {
  return apiRequest<TrackingDTO>(`/api/tracking/${encodeURIComponent(id)}`);
}
