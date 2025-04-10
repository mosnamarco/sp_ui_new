"use client";

import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/store/map-store";

export default function MapBox() {
  const mapStore = useMapStore((state) => state);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [123.509, 13.4337], // Buhi station
        zoom: 10,
        maxBounds: [
          [114.0952, 4.2158], // Southwest coordinates of Philippines
          [126.8072, 21.3217], // Northeast coordinates of Philippines
        ],
      });

      mapStore.setMap(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapStore.setMap(null);
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div
      id="map-container"
      ref={mapContainerRef}
      className="h-full w-full border rounded-lg shadow-sm"
      style={{ height: "100%" }}
    />
  );
}
