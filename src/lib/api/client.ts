import { apiRequest } from "./http";
import { toQueryString } from "./query";
import type { ImpactReportDTO } from "@/lib/dto/impactReport.dto";
import type { DonationDTO } from "@/lib/dto/donation.dto";
import type { DonationListDTO } from "@/lib/dto/donationSummary.dto";
import type { TrackingDTO } from "@/lib/dto/tracking.dto";
import type { DonationFilters } from "@/lib/dto/donationFilters.dto";

export async function getImpactReport(filters?: DonationFilters): Promise<ImpactReportDTO | null> {
  return apiRequest<ImpactReportDTO>(`/api/impact${toQueryString(filters)}`);
}

export async function listDonations(filters?: DonationFilters): Promise<DonationListDTO | null> {
  return apiRequest<DonationListDTO>(`/api/donations${toQueryString(filters)}`);
}

export async function getDonation(id: string): Promise<DonationDTO | null> {
  return apiRequest<DonationDTO>(`/api/donations/${encodeURIComponent(id)}`);
}

export async function getTracking(id: string): Promise<TrackingDTO | null> {
  return apiRequest<TrackingDTO>(`/api/tracking/${encodeURIComponent(id)}`);
}
