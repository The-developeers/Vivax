"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { CATEGORY_COLORS } from "@/lib/categoryIcons";
import type { PlaceCategory } from "@/services/places";

function pinIcon(category: PlaceCategory) {
  const color = CATEGORY_COLORS[category];
  return L.divIcon({
    className: "",
    html: `
      <svg width="26" height="34" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}" />
        <circle cx="15" cy="15" r="6" fill="#ffffff" />
      </svg>
    `,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
  });
}

export function MiniMap({
  latitude,
  longitude,
  category,
}: {
  latitude: number;
  longitude: number;
  category: PlaceCategory;
}) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={pinIcon(category)} />
    </MapContainer>
  );
}
