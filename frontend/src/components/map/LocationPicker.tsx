"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Search } from "lucide-react";

const pinIcon = L.divIcon({
  className: "",
  html: `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="#0E1943" />
      <circle cx="15" cy="15" r="6" fill="#ffffff" />
    </svg>
  `,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

const TERESINA_CENTER: [number, number] = [-5.089, -42.801];

function ClickToPlace({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const position: [number, number] = [latitude ?? TERESINA_CENTER[0], longitude ?? TERESINA_CENTER[1]];

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    setSearchError(null);

    try {
      const query = encodeURIComponent(`${search}, Teresina, PI, Brasil`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`
      );
      const results = await response.json();

      if (results.length === 0) {
        setSearchError("Endereço não encontrado. Tente ajustar o pino no mapa.");
        return;
      }

      onChange(parseFloat(results[0].lat), parseFloat(results[0].lon));
    } catch {
      setSearchError("Não foi possível buscar o endereço agora.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
          placeholder="Buscar endereço no mapa..."
          className="flex-1 rounded-full bg-offwhite px-4 py-2 text-sm text-charcoal placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-navy"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white disabled:opacity-60"
          aria-label="Buscar"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      {searchError && <p className="mt-1 text-xs text-red-600">{searchError}</p>}

      <div className="mt-2 h-56 w-full overflow-hidden rounded-2xl">
        <MapContainer center={position} zoom={14} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onChange={onChange} />
          {latitude !== null && longitude !== null && <RecenterOnChange position={position} />}
          {latitude !== null && longitude !== null && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker;
                  const pos = marker.getLatLng();
                  onChange(pos.lat, pos.lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <p className="mt-1 text-xs text-slate">Toque no mapa ou arraste o pino para ajustar.</p>
    </div>
  );
}
