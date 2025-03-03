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
      className="h-[700px] w-full border rounded-lg"
    />
  );
}
