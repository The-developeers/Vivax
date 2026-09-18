"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { listPlaces, type Place, type PlaceCategory } from "@/services/places";

const PlacesMap = dynamic(
  () => import("@/components/map/PlacesMap").then((mod) => mod.PlacesMap),
  { ssr: false }
);

const CATEGORIES: PlaceCategory[] = ["EVENTOS", "GASTRONOMIA", "LAZER"];
const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  EVENTOS: "Eventos",
  GASTRONOMIA: "Gastronomia",
  LAZER: "Lazer",
};

export default function MapaPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    listPlaces(selectedCategory ?? undefined)
      .then((data) => {
        if (!cancelled) setPlaces(data);
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar os locais no mapa.");
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-mist" />;
  }

  return (
    <div className="relative h-screen w-full">
      <PlacesMap places={places} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-col gap-2 p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        <div className="pointer-events-auto flex gap-2 overflow-x-auto">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(isActive ? null : category)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium shadow ${
                  isActive ? "bg-navy text-white" : "bg-white text-charcoal"
                }`}
              >
                {CATEGORY_LABELS[category]}
              </button>
            );
          })}
        </div>
        {error && (
          <p className="pointer-events-auto rounded-lg bg-white px-3 py-2 text-xs text-red-600 shadow">
            {error}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
