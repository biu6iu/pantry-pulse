import "server-only";
import { headers } from "next/headers";
import { apiRequest } from "./http";
import { toQueryString } from "./query";
import type { ImpactReportDTO } from "@/lib/dto/impactReport.dto";
import type { DonationDTO } from "@/lib/dto/donation.dto";
import type { DonationListDTO } from "@/lib/dto/donationSummary.dto";
import type { TrackingDTO } from "@/lib/dto/tracking.dto";
import type { DonationFilters } from "@/lib/dto/donationFilters.dto";

async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Unable to resolve request host from headers");
  }

  return `${protocol}://${host}`;
}

export async function getImpactReport(filters?: DonationFilters): Promise<ImpactReportDTO | null> {
  const origin = await getOrigin();
  return apiRequest<ImpactReportDTO>(`${origin}/api/impact${toQueryString(filters)}`);
}

export async function listDonations(filters?: DonationFilters): Promise<DonationListDTO | null> {
  const origin = await getOrigin();
  return apiRequest<DonationListDTO>(`${origin}/api/donations${toQueryString(filters)}`);
}

export async function getDonation(id: string): Promise<DonationDTO | null> {
  const origin = await getOrigin();
  return apiRequest<DonationDTO>(`${origin}/api/donations/${encodeURIComponent(id)}`);
}

export async function getTracking(id: string): Promise<TrackingDTO | null> {
  const origin = await getOrigin();
  return apiRequest<TrackingDTO>(`${origin}/api/tracking/${encodeURIComponent(id)}`);
}