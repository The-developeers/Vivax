"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { CATEGORY_COLORS } from "@/lib/categoryIcons";
import type { PlaceCategory } from "@/services/places";

type LatLng = { lat: number; lng: number };

const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="position: relative; width: 18px; height: 18px;">
      <div style="position: absolute; inset: -6px; border-radius: 9999px; background: rgba(59,130,246,0.25);"></div>
      <div style="position: absolute; inset: 0; border-radius: 9999px; background: #3B82F6; border: 2px solid white;"></div>
    </div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function destinationIcon(category: PlaceCategory) {
  const color = CATEGORY_COLORS[category];
  return L.divIcon({
    className: "",
    html: `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}" />
        <circle cx="15" cy="15" r="6" fill="#ffffff" />
      </svg>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });
}

// Enquadra a rota inteira na parte do mapa que não fica coberta pelo painel de baixo.
function FitRoute({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bottomSheetHeight = Math.round(window.innerHeight * 0.6);
    map.fitBounds(L.latLngBounds(points), {
      paddingTopLeft: [40, 140],
      paddingBottomRight: [40, bottomSheetHeight],
      maxZoom: 16,
    });
  }, [points, map]);

  return null;
}

export function RouteMap({
  origin,
  destination,
  destinationName,
  category,
  path,
}: {
  origin: LatLng;
  destination: LatLng;
  destinationName: string;
  category: PlaceCategory;
  path: [number, number][] | null;
}) {
  const framePoints: [number, number][] = path ?? [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <MapContainer
      center={[destination.lat, destination.lng]}
      zoom={14}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Rotas: <a href="https://openrouteservice.org">openrouteservice</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitRoute points={framePoints} />

      {path && (
        <>
          {/* Contorno branco por baixo deixa a linha legível sobre o mapa */}
          <Polyline positions={path} pathOptions={{ color: "#ffffff", weight: 9, opacity: 0.9 }} />
          <Polyline positions={path} pathOptions={{ color: "#2563eb", weight: 5 }} />
        </>
      )}

      <Marker position={[origin.lat, origin.lng]} icon={userLocationIcon} />
      <Marker position={[destination.lat, destination.lng]} icon={destinationIcon(category)}>
        <Tooltip permanent direction="top" offset={[0, -38]} className="font-semibold">
          {destinationName}
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
