"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect } from "react";
import { Locate } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categoryIcons";
import { PLACE_CATEGORY_LABELS, type Place, type PlaceCategory } from "@/services/places";

function markerIcon(category: PlaceCategory) {
  const color = CATEGORY_COLORS[category];
  const Icon = CATEGORY_ICONS[category];
  const glyph = renderToStaticMarkup(<Icon color="#ffffff" size={14} strokeWidth={2.5} />);

  return L.divIcon({
    className: "",
    html: `
      <div style="position: relative; width: 30px; height: 40px;">
        <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}" />
        </svg>
        <div style="position: absolute; top: 8px; left: 8px;">${glyph}</div>
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
}

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

const TERESINA_CENTER: [number, number] = [-5.089, -42.801];

function FitBoundsOnLoad({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(places.map((place) => [place.latitude, place.longitude]));
    map.fitBounds(bounds, { padding: [40, 100], maxZoom: 15 });
  }, [places, map]);

  return null;
}

function LocateControl({ userLocation }: { userLocation: { lat: number; lng: number } }) {
  const map = useMap();

  return (
    <button
      type="button"
      aria-label="Centralizar na minha localização"
      onClick={() => map.flyTo([userLocation.lat, userLocation.lng], 15)}
      className="absolute bottom-72 right-4 z-1100 flex h-11 w-11 items-center justify-center rounded-full bg-white text-navy shadow-lg"
    >
      <Locate className="h-5 w-5" />
    </button>
  );
}

export function PlacesMap({
  places,
  userLocation,
}: {
  places: Place[];
  userLocation?: { lat: number; lng: number };
}) {
  return (
    <MapContainer
      center={TERESINA_CENTER}
      zoom={13}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBoundsOnLoad places={places} />
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
          <LocateControl userLocation={userLocation} />
        </>
      )}
      {places.map((place) => (
        <Marker key={place.id} position={[place.latitude, place.longitude]} icon={markerIcon(place.category)}>
          <Popup>
            <div className="w-40">
              {place.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="mb-2 h-20 w-full rounded-lg object-cover"
                />
              )}
              <p className="text-sm font-semibold text-charcoal">{place.name}</p>
              <p className="text-xs text-slate">{PLACE_CATEGORY_LABELS[place.category]}</p>
              <Link href={`/locais/${place.id}`} className="mt-1 block text-xs font-medium text-navy underline">
                Ver detalhes
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
