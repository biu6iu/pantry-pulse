"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

// The maps sit in the middle of a long page, so scrolling over one must scroll the page, not zoom the map.
// Use inside a MapContainer with scrollWheelZoom={false}: wheel zoom turns on once the visitor clicks or
// tabs into the map, and off again when the pointer leaves it or focus moves away.
// The + / - buttons and pinch zoom work throughout.
export function ClickToScrollZoom() {
  const map = useMap();

  useEffect(() => {
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();

    map.on("click focus", enable);
    map.on("mouseout blur", disable);
    return () => {
      map.off("click focus", enable);
      map.off("mouseout blur", disable);
    };
  }, [map]);

  return null;
}
