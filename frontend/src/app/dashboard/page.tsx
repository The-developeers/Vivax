"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  LogIn,
  LogOut,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Trophy,
} from "lucide-react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { PlaceCard } from "@/components/dashboard/PlaceCard";
import { PopularEventCard } from "@/components/dashboard/PopularEventCard";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";
import { explorationStats, hiddenTrophy, popularEvents, revisitPlaces } from "@/lib/mockDashboard";
import { listPlaces, PLACE_CATEGORY_LABELS, type Place, type PlaceCategory } from "@/services/places";

// Estático por enquanto — vira geolocalização/API quando o RF02 (mapa) existir.
const CURRENT_CITY = "Teresina";
const CATEGORIES = Object.keys(PLACE_CATEGORY_LABELS) as PlaceCategory[];

export default function DashboardPage() {
  const { token, isLoading, logout } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesError, setPlacesError] = useState<string | null>(null);

  useEffect(() => {
    listPlaces()
      .then(setPlaces)
      .catch(() => setPlacesError("Não foi possível carregar os locais."));
  }, []);

  const nearbyPlaces = places.slice(0, 2);
  const explorationPercent = Math.round(
    (explorationStats.visitedCount / explorationStats.totalCount) * 100
  );

  if (isLoading) {
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
            {token ? (
              <button
                type="button"
                aria-label="Sair"
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/login"
                aria-label="Entrar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
              >
                <LogIn className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-sm text-white/90">
          <MapPin className="h-4 w-4" />
          {CURRENT_CITY}
        </div>
        <p className="mt-1 text-xs text-white/60">
          {explorationStats.rank}º em {explorationStats.city} — Faça pontos por cada local
        </p>
      </header>

      <main className="px-6">
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
            Eventos do Momento
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
            Perto de você
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
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-charcoal">
            <Trophy className="h-4 w-4 text-navy" />
            Troféus escondidos
          </h2>
          <div className="rounded-2xl bg-navy p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{hiddenTrophy.name}</p>
                <p className="text-xs text-white/70">{hiddenTrophy.hint}</p>
              </div>
            </div>
            <Link
              href="/mapa"
              className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-medium text-navy"
            >
              Ver mais
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-charcoal">Descubra por categoria</h2>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <Link
                  key={category}
                  href={`/mapa?category=${category}`}
                  className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3"
                >
                  <Icon className="h-5 w-5 text-navy" />
                  <span className="text-[11px] text-charcoal">{PLACE_CATEGORY_LABELS[category]}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-charcoal">Volte pra explorar</h2>
            <Link href="/mapa" className="text-xs font-medium text-navy hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="-mx-6 mt-2 flex gap-4 overflow-x-auto px-6 pb-1">
            {revisitPlaces.map((place) => (
              <div key={place.id} className="flex w-16 shrink-0 flex-col items-center gap-1">
                <div className="relative h-16 w-16 overflow-hidden rounded-full">
                  <Image src={place.imageUrl} alt={place.name} fill className="object-cover" />
                </div>
                <span className="w-full truncate text-center text-[10px] text-charcoal">
                  {place.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold text-charcoal">Sua exploração</h2>
          <div className="rounded-2xl bg-linear-to-r from-blue-500 to-blue-700 p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">
                Você já conheceu {explorationStats.visitedCount} de {explorationStats.totalCount}{" "}
                pontos de {explorationStats.city} ({explorationPercent}%)
              </p>
              <Shield className="h-8 w-8 shrink-0 text-white/80" />
            </div>
            <Link
              href="/mapa"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2"
            >
              Veja seu mapa de exploração
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
