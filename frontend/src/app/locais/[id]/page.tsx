"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Heart,
  MapPin,
  Share2,
  Star,
  Ticket,
  Trophy,
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { PlaceImage } from "@/components/dashboard/PlaceImage";
import { useFavoritePlaces } from "@/hooks/useFavoritePlaces";
import { useSavedPlaces } from "@/hooks/useSavedPlaces";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useVisitedPlaces, VISIT_XP_REWARD } from "@/hooks/useVisitedPlaces";
import { getAmenityIcon } from "@/lib/amenityIcons";
import { CATEGORY_COLORS } from "@/lib/categoryIcons";
import { mockGalleryPhotos, mockReviews } from "@/lib/mockCommunity";
import { formatDistance, haversineDistanceKm } from "@/lib/geo";
import { getOpenStatus } from "@/lib/openingHours";
import { sharePlace } from "@/lib/share";
import {
  getPlaceById,
  getSimilarPlaces,
  PLACE_CATEGORY_LABELS,
  type Place,
  type PlaceDetail,
} from "@/services/places";

const MiniMap = dynamic(() => import("@/components/map/MiniMap").then((mod) => mod.MiniMap), {
  ssr: false,
});

const DISCOVERY_XP_REWARD = 30;

export default function PlaceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { location: userLocation } = useUserLocation();
  const { isSaved, toggle: toggleSaved } = useSavedPlaces();
  const { isFavorite, toggle: toggleFavorite } = useFavoritePlaces();
  const { isVisited, toggle: toggleVisited } = useVisitedPlaces();

  const [place, setPlace] = useState<PlaceDetail | null | undefined>(undefined);
  const [similarPlaces, setSimilarPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    getPlaceById(params.id)
      .then((data) => setPlace(data))
      .catch(() => setError("Não foi possível carregar este local."));
  }, [params.id]);

  useEffect(() => {
    getSimilarPlaces(params.id).then(setSimilarPlaces);
  }, [params.id]);

  if (place === undefined) {
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

  const distanceKm = haversineDistanceKm(
    userLocation.lat,
    userLocation.lng,
    place.latitude,
    place.longitude
  );
  const openStatus = getOpenStatus(place.openingHours);
  const saved = isSaved(place.id);
  const favorited = isFavorite(place.id);
  const visited = isVisited(place.id);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

  async function handleShare() {
    if (!place) return;
    const result = await sharePlace({
      title: place.name,
      text: `Dá uma olhada em ${place.name} no Viva+!`,
      url: window.location.href,
    });
    if (result === "copied") setShareMessage("Link copiado!");
    if (result === "shared") setShareMessage(null);
    if (result === "copied") setTimeout(() => setShareMessage(null), 2000);
  }

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Compartilhar"
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={saved ? "Remover dos salvos" : "Salvar"}
              onClick={() => toggleSaved(place.id)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"
            >
              <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {shareMessage && (
          <span className="absolute left-1/2 top-16 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
            {shareMessage}
          </span>
        )}

        {!visited && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            Troféu escondido
          </div>
        )}
      </div>

      <div className="relative -mt-6 rounded-t-3xl bg-mist px-6 pt-6">
        <h1 className="text-2xl font-bold text-charcoal">{place.name}</h1>
        <span
          className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: CATEGORY_COLORS[place.category] }}
        >
          {PLACE_CATEGORY_LABELS[place.category]}
        </span>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {formatDistance(distanceKm)}
          </span>
          {place.rating !== null && (
            <>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {place.rating.toFixed(1)}
              </span>
            </>
          )}
        </div>

        <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-800">
          <Trophy className="h-3.5 w-3.5" />
          {visited
            ? "Você já descobriu esse local!"
            : `Descubra esse local e ganhe +${DISCOVERY_XP_REWARD} XP`}
        </p>

        <div className="mt-4 flex items-center gap-3">
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
            aria-label={favorited ? "Remover dos favoritos" : "Favoritar"}
            onClick={() => toggleFavorite(place.id)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-navy text-navy"
          >
            <Heart className="h-4 w-4" fill={favorited ? "currentColor" : "none"} />
          </button>
        </div>

        {place.amenities.length > 0 && (
          <div className="-mx-6 mt-4 flex gap-2 overflow-x-auto px-6 pb-1">
            {place.amenities.map((amenity) => (
              <span
                key={amenity}
                className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-charcoal shadow-sm"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <h2 className="mt-6 font-bold text-charcoal">Sobre esse lugar</h2>
        <p className="mt-1 text-sm leading-relaxed text-charcoal/80">{place.description}</p>

        {openStatus && (
          <p className="mt-2 flex items-center gap-2 text-sm text-charcoal/80">
            <Clock className="h-4 w-4 shrink-0 text-navy" />
            <span className={openStatus.isOpen ? "text-green-700" : "text-red-600"}>
              {openStatus.label}
            </span>
            {" - "}
            {openStatus.hoursLabel}
          </p>
        )}
        <p className="mt-1 flex items-center gap-2 text-sm text-charcoal/80">
          <Ticket className="h-4 w-4 shrink-0 text-navy" />
          Entrada {place.isFree ? "gratuita" : "paga"}
        </p>

        {place.amenities.length > 0 && (
          <>
            <h2 className="mt-6 font-bold text-charcoal">O que esperar</h2>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {place.amenities.map((amenity) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 rounded-xl bg-white p-3 text-sm text-charcoal"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-navy" />
                    {amenity}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <h2 className="mt-6 font-bold text-charcoal">Fotos da galeria</h2>
        <p className="text-xs text-slate">Em breve: fotos enviadas por quem já visitou.</p>
        <div className="-mx-6 mt-2 flex gap-3 overflow-x-auto px-6 pb-1">
          {mockGalleryPhotos.map((url) => (
            <div key={url} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl">
              <Image src={url} alt="" fill className="object-cover opacity-70" />
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-bold text-charcoal">Opiniões da galera</h2>
        <p className="text-xs text-slate">Em breve: avaliações de quem já visitou de verdade.</p>
        <div className="mt-2 flex flex-col gap-3">
          {mockReviews.map((review) => (
            <div key={review.id} className="rounded-xl bg-white p-3">
              <div className="flex items-center gap-2">
                <Avatar name={review.name} size={32} />
                <div>
                  <p className="text-sm font-semibold text-charcoal">{review.name}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-charcoal/80">{review.comment}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 font-bold text-charcoal">Localização</h2>
        <div className="mt-2 h-40 w-full overflow-hidden rounded-2xl">
          <MiniMap latitude={place.latitude} longitude={place.longitude} category={place.category} />
        </div>

        {similarPlaces.length > 0 && (
          <>
            <h2 className="mt-6 font-bold text-charcoal">Se curtiu, também vai gostar</h2>
            <div className="-mx-6 mt-2 flex gap-3 overflow-x-auto px-6 pb-1">
              {similarPlaces.map((similar) => {
                const similarDistance = haversineDistanceKm(
                  userLocation.lat,
                  userLocation.lng,
                  similar.latitude,
                  similar.longitude
                );
                return (
                  <Link key={similar.id} href={`/locais/${similar.id}`} className="w-36 shrink-0">
                    <PlaceImage
                      src={similar.imageUrl}
                      alt={similar.name}
                      className="h-24 w-full rounded-xl"
                    />
                    <p className="mt-1.5 truncate text-xs font-semibold text-charcoal">
                      {similar.name}
                    </p>
                    <p className="text-[11px] text-slate">
                      {PLACE_CATEGORY_LABELS[similar.category]} • {formatDistance(similarDistance)}
                    </p>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-1000 flex items-center gap-3 bg-mist p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          onClick={() => toggleVisited(place.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ${
            visited ? "bg-green-600 text-white" : "bg-navy text-white"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {visited ? "Local visitado" : "Marcar como visitado"}
        </button>
        {!visited && (
          <span className="shrink-0 rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800">
            +{VISIT_XP_REWARD} XP
          </span>
        )}
      </div>
    </div>
  );
}
