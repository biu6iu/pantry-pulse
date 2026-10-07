'use client';

import type { TrackingDTO, TrackingLocationDTO } from '@/lib/dto/tracking.dto';
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

export function TrackingMap({ tracking }: { tracking: TrackingDTO }) {
  if (!hasCoords(tracking.origin) || !hasCoords(tracking.receiver)) {
    return (
      <p>
        Map unavailable. Destination coordinates are not available for this order yet.
      </p>
    );
  }

  return (
    <div className="tracking-map space-y-3" aria-label="Donation route map">
      <p>
        From {labelFor(tracking.origin)} to {labelFor(tracking.receiver)}.
        Destination is approximate (within about 1 km).
      </p>
      <OsmRouteMapLoader
        origin={{
          lat: tracking.origin.lat,
          lng: tracking.origin.lng,
          label: labelFor(tracking.origin),
        }}
        destination={{
          lat: tracking.receiver.lat,
          lng: tracking.receiver.lng,
          label: labelFor(tracking.receiver),
        }}
      />
    </div>
  );
}
