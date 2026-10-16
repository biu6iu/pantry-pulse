"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint } from "./osmRouteMap";

export type ReachPoint = MapPoint & {
  items: number; // sets the dot size
};

// a dot with one item is the minimum size, and the area grows with the number of items
function radiusFor(items: number) {
  return 6 + 2 * Math.sqrt(Math.max(0, items - 1));
}

function FitAll({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [30, 30], maxZoom: 8 });
  }, [map, points]);

  return null;
}

export default function ReachMap({ origin, points }: { origin: MapPoint; points: ReachPoint[] }) {
  // kept stable so the map only refits when the points change
  const everyPoint = useMemo(() => [origin, ...points], [origin, points]);

  return (
    <MapContainer
      center={[origin.lat, origin.lng]}
      zoom={4}
      // the map sits in the middle of the page, so the wheel scrolls the page rather than zooming
      scrollWheelZoom={false}
      style={{ height: "460px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={`${p.lat},${p.lng}`}
          center={[p.lat, p.lng]}
          radius={radiusFor(p.items)}
          pathOptions={{ color: "#ffffff", weight: 1.5, fillColor: "#d02327", fillOpacity: 0.8 }}
        >
          <Popup>{p.label}</Popup>
        </CircleMarker>
      ))}
      <CircleMarker
        center={[origin.lat, origin.lng]}
        radius={8}
        pathOptions={{ color: "#ffffff", weight: 2, fillColor: "#141a43", fillOpacity: 1 }}
      >
        <Popup>{origin.label}</Popup>
      </CircleMarker>
      <FitAll points={everyPoint} />
    </MapContainer>
  );
}
