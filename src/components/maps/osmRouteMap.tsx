"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  lat: number;
  lng: number;
  label: string;
};

function FitRoute({ start, end }: { start: MapPoint; end: MapPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (!end) {
      map.setView([start.lat, start.lng], 3);
      return;
    }
    map.fitBounds(
      [
        [start.lat, start.lng],
        [end.lat, end.lng],
      ],
      { padding: [40, 40], maxZoom: 11 },
    );
  }, [map, start.lat, start.lng, end?.lat, end?.lng]);

  return null;
}

function AnimatedRoute({
  start,
  end,
  replayKey,
}: {
  start: [number, number];
  end: [number, number];
  replayKey: string;
}) {
  const map = useMap();

  useEffect(() => {
    const line = L.polyline([start], {
      color: "#c4453a",
      weight: 3,
    }).addTo(map);

    const durationMs = 1600;
    const startedAt = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const lat = start[0] + (end[0] - start[0]) * progress;
      const lng = start[1] + (end[1] - start[1]) * progress;
      line.setLatLngs([start, [lat, lng]]);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      map.removeLayer(line);
    };
  }, [map, start[0], start[1], end[0], end[1], replayKey]);

  return null;
}

const pin = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#c4453a;border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

const APPROXIMATE_RADIUS_METERS = 1100;

export default function OsmRouteMap({
  origin,
  destination,
  routeKey,
}: {
  origin: MapPoint;
  destination: MapPoint | null;
  routeKey: string;
}) {
  const start: [number, number] = [origin.lat, origin.lng];
  const end: [number, number] | null = destination
    ? [destination.lat, destination.lng]
    : null;

  return (
    <MapContainer
      center={start}
      zoom={3}
      scrollWheelZoom
      style={{ height: "420px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={start} icon={pin}>
        <Popup>{origin.label}</Popup>
      </Marker>
      {destination && end ? (
        <>
          <Circle
            center={end}
            radius={APPROXIMATE_RADIUS_METERS}
            pathOptions={{ color: "#c4453a", fillColor: "#c4453a", fillOpacity: 0.18, weight: 1 }}
          />
          <Marker position={end} icon={pin}>
            <Popup>{destination.label}</Popup>
          </Marker>
          <AnimatedRoute start={start} end={end} replayKey={routeKey} />
        </>
      ) : null}
      <FitRoute start={origin} end={destination} />
    </MapContainer>
  );
}
