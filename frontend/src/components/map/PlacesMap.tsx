"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Place } from "@/services/places";

// Marcador customizado em SVG (navy da marca), em vez dos ícones padrão do
// Leaflet — evita o problema conhecido de resolução de caminho de imagem
// dos ícones default quando empacotados com Webpack/Turbopack.
const markerIcon = L.divIcon({
  className: "",
  html: `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="#0E1943" />
      <circle cx="15" cy="15" r="6" fill="#F7F8F5" />
    </svg>
  `,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
  popupAnchor: [0, -36],
});

const TERESINA_CENTER: [number, number] = [-5.089, -42.801];

export function PlacesMap({ places }: { places: Place[] }) {
  return (
    <MapContainer
      center={TERESINA_CENTER}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]} icon={markerIcon}>
          <Popup>
            <div className="w-40">
              {place.imageUrl && (
                <div className="relative mb-2 h-20 w-full overflow-hidden rounded-lg">
                  <Image src={place.imageUrl} alt={place.name} fill className="object-cover" />
                </div>
              )}
              <p className="text-sm font-semibold text-charcoal">{place.name}</p>
              {place.rating !== null && (
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate">
                  <Star className="h-3 w-3 fill-current" />
                  {place.rating.toFixed(1)}
                </span>
              )}
              <p className="mt-1 text-xs text-slate">{place.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
