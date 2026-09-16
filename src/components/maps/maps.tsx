'use client';

import { useEffect, useState } from 'react';
import type { TrackingDTO } from '@/lib/dto/tracking.dto';

export function TrackingMap({ donationId }: { donationId: string }) {
  const [tracking, setTracking] = useState<TrackingDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(`/api/tracking/${donationId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      })
      .then((data: TrackingDTO) => {
        if (!cancelled) setTracking(data);
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

  return (
    <div className="tracking-map">
      <p>Status: {tracking.status}</p>
      <p>From: {tracking.origin.organisation}</p>
      <p>To: {tracking.receiver.organisation}</p>
      <ul>
        {tracking.timeline.map((stage) => (
          <li key={stage.stage}>
            {stage.label} {stage.complete ? '✓' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
