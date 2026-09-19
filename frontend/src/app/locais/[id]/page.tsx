"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bookmark, Clock, MapPin, ChevronLeft, Star, Ticket } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { getPlaceById, PLACE_CATEGORY_LABELS, type PlaceDetail } from "@/services/places";

export default function PlaceDetailPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isSaved, toggle } = useSavedPlaces();

  const [place, setPlace] = useState<PlaceDetail | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    getPlaceById(params.id)
      .then((data) => setPlace(data))
      .catch(() => setError("Não foi possível carregar este local."));
  }, [params.id, isAuthenticated]);

  if (authLoading || !isAuthenticated || place === undefined) {
    return <div className="min-h-screen bg-mist" />;
  }

  if (error || place === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mist px-6 text-center">
        <p className="text-sm text-slate">{error ?? "Local não encontrado."}</p>
        <Link href="/mapa" className="text-sm font-medium text-navy hover:underline">
          Voltar para o mapa
        </Link>
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  const saved = isSaved(place.id);

  return (
    <div className="min-h-screen bg-mist pb-28">
      <div className="relative h-64 w-full bg-charcoal">
        {place.imageUrl && (
          <Image src={place.imageUrl} alt={place.name} fill priority className="object-cover" />
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-bold text-white">Viva+</p>
          <div className="h-9 w-9" />
        </div>
      </div>

      <div className="relative -mt-6 rounded-t-3xl bg-mist px-6 pt-6">
        <h1 className="text-2xl font-bold text-charcoal">{place.name}</h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate">
          {PLACE_CATEGORY_LABELS[place.category]}
          {place.rating !== null && (
            <>
              <span>•</span>
              <Star className="h-3.5 w-3.5 fill-current" />
              {place.rating.toFixed(1)}
            </>
          )}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-charcoal/80">{place.description}</p>

        <h2 className="mt-6 font-bold text-charcoal">Informações</h2>
        <div className="mt-2 flex flex-col gap-2 text-sm text-charcoal/80">
          {place.openingHours && (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-navy" />
              Horário: {place.openingHours}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Ticket className="h-4 w-4 shrink-0 text-navy" />
            Entrada: {place.isFree ? "Gratuita" : "Paga"}
          </span>
          {place.address && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-navy" />
              {place.address}
            </span>
          )}
        </div>

        {place.activities.length > 0 && (
          <>
            <h2 className="mt-6 font-bold text-charcoal">Eventos neste local</h2>
            <div className="-mx-6 mt-2 flex gap-3 overflow-x-auto px-6 pb-1">
              {place.activities.map((activity) => (
                <div key={activity.id} className="w-44 shrink-0 rounded-2xl bg-navy p-3 text-white">
                  <p className="text-sm font-semibold">{activity.title}</p>
                  <p className="mt-1 text-xs text-white/80">{activity.schedule}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-1000 flex gap-3 bg-mist p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full bg-navy py-3 text-center text-sm font-semibold text-white"
        >
          Como chegar
        </a>
        <button
          type="button"
          onClick={() => toggle(place.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-sm font-semibold ${
            saved ? "border-navy bg-navy text-white" : "border-navy text-navy"
          }`}
        >
          <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
          {saved ? "Salvo" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
