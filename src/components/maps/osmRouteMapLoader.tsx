"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./osmRouteMap";

const OsmRouteMap = dynamic(() => import("./osmRouteMap"), {
  ssr: false,
  loading: () => <p>Loading map…</p>,
});

export default function OsmRouteMapLoader(props: {
  origin: MapPoint;
  destination: MapPoint | null;
  routeKey: string;
}) {
  return <OsmRouteMap {...props} />;
}
