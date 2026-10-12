'use client';

import type { TrackingDTO, TrackingLocationDTO } from '@/lib/dto/tracking.dto';
import { ORIGIN } from "@/lib/config/origin";
import OsmRouteMapLoader from "./osmRouteMapLoader";

function hasCoords(
  location: TrackingLocationDTO,
): location is TrackingLocationDTO & { lat: number; lng: number } {
  return location.lat != null && location.lng != null;
}

function labelFor(location: TrackingLocationDTO) {
  const place = [location.city, location.state, location.country].filter(Boolean).join(", ");
  return place ? `${location.organisation} (${place})` : location.organisation;
}

const DEFAULT_ORIGIN = {
  lat: ORIGIN.lat as number,
  lng: ORIGIN.lng as number,
  label: labelFor(ORIGIN),
};

export function TrackingMap({ tracking }: { tracking: TrackingDTO | null }) {
  const origin =
    tracking && hasCoords(tracking.origin)
      ? {
          lat: tracking.origin.lat,
          lng: tracking.origin.lng,
          label: labelFor(tracking.origin),
        }
      : DEFAULT_ORIGIN;

  const destination =
    tracking && hasCoords(tracking.receiver)
      ? {
          lat: tracking.receiver.lat,
          lng: tracking.receiver.lng,
          label: labelFor(tracking.receiver),
        }
      : null;

  return (
    <div className="tracking-map" aria-label="Donation route map">
      <OsmRouteMapLoader
        origin={origin}
        destination={destination}
        routeKey={tracking?.id ?? "empty"}
      />
    </div>
  );
}
