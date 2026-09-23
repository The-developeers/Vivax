"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight, Search, X } from "lucide-react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import {
  listPlaces,
  PLACE_CATEGORY_LABELS,
  type ListPlacesFilters,
  type Place,
  type PlaceCategory,
} from "@/services/places";

const PlacesMap = dynamic(
  () => import("@/components/map/PlacesMap").then((mod) => mod.PlacesMap),
  { ssr: false }
);

function formatPlaceMeta(place: Place): string {
  const parts: string[] = [];

  if (place.eventDate) {
    const date = new Date(place.eventDate);
    const isToday = date.toDateString() === new Date().toDateString();
    parts.push(isToday ? "Hoje" : date.toLocaleDateString("pt-BR"));
    parts.push(date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  } else {
    parts.push(PLACE_CATEGORY_LABELS[place.category]);
  }

  parts.push(place.isFree ? "Grátis" : "Pago");

  return parts.join(" • ");
}

export default function MapaPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [onlyToday, setOnlyToday] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);
  const [category, setCategory] = useState<Extract<PlaceCategory, "EVENTOS" | "TURISMO"> | null>(
    null
  );
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const filters: ListPlacesFilters = {
      today: onlyToday,
      isFree: onlyFree,
      category: category ?? undefined,
    };

    let cancelled = false;
    listPlaces(filters)
      .then((data) => {
        if (!cancelled) setPlaces(data);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar os locais no mapa.");
      });

    return () => {
      cancelled = true;
    };
  }, [onlyToday, onlyFree, category]);

  const visiblePlaces = useMemo(() => {
    if (!search.trim()) return places;
    const term = search.trim().toLowerCase();
    return places.filter(
      (place) =>
        place.name.toLowerCase().includes(term) || place.description.toLowerCase().includes(term)
    );
  }, [places, search]);

  return (
    <div className="flex h-screen flex-col bg-mist">
      <header className="shrink-0 bg-navy px-6 pb-5 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold">Viva+</p>
            <p className="text-xs text-white/70">Viva mais da sua cidade.</p>
          </div>
          <button
            type="button"
            aria-label="Notificações"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
        </div>
      </header>

      <div className="shrink-0 px-6 py-4">
        <h1 className="text-xl font-bold text-charcoal">Explorar</h1>
        <p className="text-xs text-slate">Tudo que está rolando por perto.</p>

        <div className="relative mt-3">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar lugar ou evento..."
            className="w-full rounded-full bg-white py-3 pl-11 pr-4 text-sm text-charcoal placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setOnlyToday((v) => !v)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium ${
              onlyToday ? "bg-navy text-white" : "bg-white text-charcoal"
            }`}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setOnlyFree((v) => !v)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium ${
              onlyFree ? "bg-navy text-white" : "bg-white text-charcoal"
            }`}
          >
            Grátis
          </button>
          <button
            type="button"
            onClick={() => setCategory((c) => (c === "EVENTOS" ? null : "EVENTOS"))}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium ${
              category === "EVENTOS" ? "bg-navy text-white" : "bg-white text-charcoal"
            }`}
          >
            Evento
          </button>
          <button
            type="button"
            onClick={() => setCategory((c) => (c === "TURISMO" ? null : "TURISMO"))}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium ${
              category === "TURISMO" ? "bg-navy text-white" : "bg-white text-charcoal"
            }`}
          >
            Turismo
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 px-4 pb-4">
        <div className="relative h-full w-full overflow-hidden rounded-3xl">
          <PlacesMap places={visiblePlaces} onSelect={setSelectedPlace} />
        </div>

        {error && (
          <p className="absolute inset-x-6 top-3 z-1000 rounded-lg bg-white px-3 py-2 text-center text-xs text-red-600 shadow">
            {error}
          </p>
        )}

        {selectedPlace && (
          <Link
            href={`/locais/${selectedPlace.id}`}
            className="absolute inset-x-6 bottom-24 z-1000 flex items-center gap-3 rounded-2xl bg-navy p-4 text-white shadow-xl"
          >
            <div className="flex-1">
              <p className="pr-6 font-semibold">{selectedPlace.name}</p>
              <p className="mt-1 text-xs text-white/80">{formatPlaceMeta(selectedPlace)}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/70" />
            <button
              type="button"
              aria-label="Fechar"
              onClick={(e) => {
                e.preventDefault();
                setSelectedPlace(null);
              }}
              className="absolute right-3 top-3 text-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          </Link>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
