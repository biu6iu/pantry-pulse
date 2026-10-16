"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./osmRouteMap";
import type { ReachPoint } from "./reachMap";

// Leaflet needs the browser, so the map is only loaded there
const ReachMap = dynamic(() => import("./reachMap"), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

export default function ReachMapLoader(props: { origin: MapPoint; points: ReachPoint[] }) {
  return <ReachMap {...props} />;
}
