"use client";

import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ChevronLeft, List, Search, Trophy, X } from "lucide-react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { NearbyListItem, NearbyPreviewCard } from "@/components/map/NearbyPlaceCard";
import { useUserLocation } from "@/hooks/useUserLocation";
import { formatDistance, haversineDistanceKm } from "@/lib/geo";
import { listPlaces, PLACE_CATEGORY_LABELS, type Place, type PlaceCategory } from "@/services/places";

const CATEGORIES = Object.keys(PLACE_CATEGORY_LABELS) as PlaceCategory[];

const PlacesMap = dynamic(
  () => import("@/components/map/PlacesMap").then((mod) => mod.PlacesMap),
  { ssr: false }
);

export default function MapaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mist" />}>
      <MapaPageContent />
    </Suspense>
  );
}

function MapaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { location: userLocation } = useUserLocation();

  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PlaceCategory | null>(() => {
    const param = searchParams.get("category");
    return (CATEGORIES as string[]).includes(param ?? "") ? (param as PlaceCategory) : null;
  });
  const [listOpen, setListOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPlaces({ category: category ?? undefined })
      .then((data) => {
        if (!cancelled) setPlaces(data);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar os locais no mapa.");
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const visiblePlaces = useMemo(() => {
    if (!search.trim()) return places;
    const term = search.trim().toLowerCase();
    return places.filter(
      (place) =>
        place.name.toLowerCase().includes(term) || place.description.toLowerCase().includes(term)
    );
  }, [places, search]);

  const nearby = useMemo(() => {
    return visiblePlaces
      .map((place) => ({
        place,
        distanceKm: haversineDistanceKm(
          userLocation.lat,
          userLocation.lng,
          place.latitude,
          place.longitude
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [visiblePlaces, userLocation]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-mist">
      <div className="absolute inset-0">
        <PlacesMap places={visiblePlaces} userLocation={userLocation} />
      </div>

      <div className="absolute inset-x-0 top-0 z-1000 flex flex-col gap-2 p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => router.push("/dashboard")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md"
          >
            <ChevronLeft className="h-5 w-5 text-charcoal" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lugares..."
              className="w-full rounded-full bg-white py-3 pl-11 pr-4 text-sm text-charcoal placeholder:text-slate shadow-md focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium shadow-md ${
              category === null ? "bg-navy text-white" : "bg-white text-charcoal"
            }`}
          >
            Tudo
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory((c) => (c === cat ? null : cat))}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium shadow-md ${
                category === cat ? "bg-navy text-white" : "bg-white text-charcoal"
              }`}
            >
              {PLACE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-lg bg-white px-3 py-2 text-center text-xs text-red-600 shadow-md">
            {error}
          </p>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-20 z-1000">
        <div className="rounded-t-3xl bg-white px-5 pb-3 pt-4 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-charcoal">{nearby.length} lugares aqui perto</p>
              <p className="text-xs text-slate">bora sair de casa?</p>
            </div>
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-3.5 py-2 text-xs font-medium text-white"
            >
              <List className="h-3.5 w-3.5" />
              Lista
            </button>
          </div>

          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
            {nearby.slice(0, 8).map(({ place, distanceKm }) => (
              <NearbyPreviewCard
                key={place.id}
                place={place}
                distanceLabel={formatDistance(distanceKm)}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />

      <div
        className={`fixed inset-0 z-2000 flex flex-col bg-mist transition-transform duration-300 ease-out ${
          listOpen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-black/5 bg-white px-6 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
          <button
            type="button"
            aria-label="Fechar lista"
            onClick={() => setListOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-offwhite"
          >
            <X className="h-4 w-4 text-charcoal" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-charcoal">{nearby.length} lugares aqui perto</h1>
            <p className="text-xs text-slate">Veja todos os lugares listados</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-3">
            {nearby.map(({ place, distanceKm }) => (
              <NearbyListItem
                key={place.id}
                place={place}
                distanceLabel={formatDistance(distanceKm)}
              />
            ))}
          </div>

          <div className="mt-6 mb-4 rounded-2xl bg-linear-to-r from-blue-600 to-blue-800 p-4 text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide">
              <Trophy className="h-3 w-3" />
              Missão da semana
            </span>
            <p className="mt-2 font-semibold">Explore 3 pontos novos</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>2 de 3 completas</span>
              <span className="font-semibold">+50 XP</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-amber-400" style={{ width: "66%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
