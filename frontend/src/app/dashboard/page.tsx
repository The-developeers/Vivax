"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CalendarDays, LogOut, MapPin, Search, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { PlaceCard } from "@/components/dashboard/PlaceCard";
import { PopularEventCard } from "@/components/dashboard/PopularEventCard";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { featuredEvent, popularEvents } from "@/lib/mockDashboard";
import { listPlaces, PLACE_CATEGORY_LABELS, type Place, type PlaceCategory } from "@/services/places";

// Estático por enquanto — vira geolocalização/API quando o RF02 (mapa) existir.
const CURRENT_CITY = "Teresina - PI";
const BROWSE_CATEGORIES: PlaceCategory[] = ["GASTRONOMIA", "LAZER", "TURISMO"];

function useCurrentTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      setTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    }
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

export default function DashboardPage() {
  const { isLoading, isAuthenticated } = useRequireAuth();
  const { logout } = useAuth();
  const time = useCurrentTime();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [placesError, setPlacesError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    listPlaces()
      .then(setPlaces)
      .catch(() => setPlacesError("Não foi possível carregar os locais."));
  }, [isAuthenticated]);

  const nearbyPlaces = places.slice(0, 2);
  const visiblePlaces = selectedCategory
    ? places.filter((place) => place.category === selectedCategory)
    : places;

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-mist" />;
  }

  return (
    <div className="min-h-screen bg-mist pb-28">
      <header className="bg-navy px-6 pb-5 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold">Viva+</p>
            <p className="text-xs text-white/70">Viva mais da sua cidade.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notificações"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <button
              type="button"
              aria-label="Sair"
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1 text-white/90">
            <MapPin className="h-4 w-4" />
            {CURRENT_CITY}
          </span>
          {time && <span className="text-white/70">{time}</span>}
        </div>
      </header>

      <main className="px-6">
        <section className="mt-5">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-charcoal">
            <CalendarDays className="h-4 w-4 text-navy" />
            Acontecendo hoje
          </h2>
          <div className="rounded-2xl bg-amber-100 p-4">
            <span className="inline-block rounded-full bg-charcoal/10 px-2 py-0.5 text-[11px] font-semibold text-charcoal">
              HOJE {featuredEvent.time}
            </span>
            <p className="mt-2 font-semibold text-charcoal">{featuredEvent.title}</p>
            <p className="mt-1 text-xs text-charcoal/70">{featuredEvent.description}</p>
          </div>
        </section>

        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            type="text"
            placeholder="O que você quer fazer hoje?"
            className="w-full rounded-full bg-white py-3 pl-11 pr-4 text-sm text-charcoal placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-charcoal">
            <Sparkles className="h-4 w-4 text-navy" />
            Eventos Populares
          </h2>
          <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1">
            {popularEvents.map((event) => (
              <PopularEventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-charcoal">
            <MapPin className="h-4 w-4 text-navy" />
            Lugares perto de você
          </h2>
          {placesError && <p className="text-xs text-red-600">{placesError}</p>}
          <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1">
            {nearbyPlaces.map((place) => (
              <Link key={place.id} href={`/locais/${place.id}`}>
                <PlaceCard place={place} />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-charcoal">Descubra por categoria</h2>
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
            {BROWSE_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(isActive ? null : category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    isActive ? "bg-navy text-white" : "bg-white text-charcoal"
                  }`}
                >
                  {PLACE_CATEGORY_LABELS[category]}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {visiblePlaces.map((place) => (
              <Link key={place.id} href={`/locais/${place.id}`}>
                <PlaceCard place={place} className="w-full" />
              </Link>
            ))}
          </div>

          <Link
            href="/mapa"
            className="mt-4 block w-full text-center text-sm font-medium text-navy hover:underline"
          >
            Ver mais
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
