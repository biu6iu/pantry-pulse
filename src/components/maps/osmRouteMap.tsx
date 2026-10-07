"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  lat: number;
  lng: number;
  label: string;
};

function FitTwoPoints({ start, end }: { start: MapPoint; end: MapPoint }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(
      [
        [start.lat, start.lng],
        [end.lat, end.lng],
      ],
      { padding: [40, 40], maxZoom: 11 },
    );
  }, [map, start.lat, start.lng, end.lat, end.lng]);

  return null;
}

const pin = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;background:#c4453a;border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
});

// Backend rounds receiver coords to 2 decimal places (~1.1km), so don't imply a street pin.
const APPROXIMATE_RADIUS_METERS = 1100;

export default function OsmRouteMap({
  origin,
  destination,
}: {
  origin: MapPoint;
  destination: MapPoint;
}) {
  const start: [number, number] = [origin.lat, origin.lng];
  const end: [number, number] = [destination.lat, destination.lng];

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
      <Circle
        center={end}
        radius={APPROXIMATE_RADIUS_METERS}
        pathOptions={{ color: "#c4453a", fillColor: "#c4453a", fillOpacity: 0.22, weight: 2 }}
      >
        <Popup>{destination.label} (approximate)</Popup>
      </Circle>
      <Polyline positions={[start, end]} pathOptions={{ color: "#c4453a", weight: 3 }} />
      <FitTwoPoints start={origin} end={destination} />
    </MapContainer>
  );
}