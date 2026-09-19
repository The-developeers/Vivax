"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { Place, PlaceCategory } from "@/services/places";

const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  EVENTOS: "#F59E0B",
  GASTRONOMIA: "#EC4899",
  LAZER: "#3B82F6",
  TURISMO: "#EF4444",
};

function markerIcon(category: PlaceCategory) {
  const color = CATEGORY_COLORS[category];
  return L.divIcon({
    className: "",
    html: `
      <svg width="28" height="36" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}" />
        <circle cx="15" cy="15" r="6" fill="#ffffff" />
      </svg>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });
}

const TERESINA_CENTER: [number, number] = [-5.089, -42.801];

function FitBoundsOnLoad({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(places.map((place) => [place.latitude, place.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [places, map]);

  return null;
}

export function PlacesMap({
  places,
  onSelect,
}: {
  places: Place[];
  onSelect: (place: Place) => void;
}) {
  return (
    <MapContainer center={TERESINA_CENTER} zoom={13} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBoundsOnLoad places={places} />
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={markerIcon(place.category)}
          eventHandlers={{ click: () => onSelect(place) }}
        />
      ))}
    </MapContainer>
  );
}
