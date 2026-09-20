'use client';

import { useEffect, useState } from 'react';
import type { TrackingDTO, TrackingLocationDTO } from '@/lib/dto/tracking.dto';
import { getTracking } from "@/lib/api/client";
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


export function TrackingMap({ donationId }: { donationId: string }) {
  const [tracking, setTracking] = useState<TrackingDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTracking(null);
    getTracking(donationId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError("Donation not found");
          return;
        }
        setTracking(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [donationId]);
  if (loading) return <p>Loading tracking info...</p>;
  if (error) return <p className="text-red-600">Failed to load tracking info: {error}</p>;
  if (!tracking) return null;
  if (!hasCoords(tracking.origin) || !hasCoords(tracking.receiver)) {
    return (
      <p>
        This order does not have mapped coordinates yet. Origin and destination
        pins come from the backend (`lat` / `lng`), not from the map.
      </p>
    );
  }
  return (
    <div className="tracking-map">
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

