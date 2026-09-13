import { DonationStatus } from "@/lib/models/donationStatus";

export interface TrackingLocationDTO {
  id: string | null;
  organisation: string;
  contactName: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

export type TrackingStage = "CREATED" | "COMPLETED";

export interface TrackingStageDTO {
  stage: TrackingStage;
  label: string;
  occurredAt: string | null;
  complete: boolean;
}

export interface TrackingDTO {
  id: string;
  status: DonationStatus;
  origin: TrackingLocationDTO;
  receiver: TrackingLocationDTO;
  timeline: TrackingStageDTO[];
}
