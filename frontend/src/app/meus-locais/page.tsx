"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { PlaceImage } from "@/components/dashboard/PlaceImage";
import { useRequireEntrepreneur } from "@/hooks/useRequireEntrepreneur";
import { deletePlace, listMyPlaces, PLACE_CATEGORY_LABELS, type Place } from "@/services/places";

export default function MeusLocaisPage() {
  const { isLoading, isAuthorized } = useRequireEntrepreneur();
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);

  function loadPlaces() {
    listMyPlaces()
      .then(setPlaces)
      .catch(() => setError("Não foi possível carregar seus locais."));
  }

  useEffect(() => {
    if (isAuthorized) loadPlaces();
  }, [isAuthorized]);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que quer apagar esse local?")) return;

    try {
      await deletePlace(id);
      setPlaces((prev) => prev.filter((place) => place.id !== id));
    } catch {
      setError("Não foi possível apagar. Tente novamente.");
    }
  }

  if (isLoading || !isAuthorized) {
    return <div className="min-h-screen bg-mist" />;
  }

  return (
    <div className="min-h-screen bg-mist px-6 pb-10 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          aria-label="Voltar"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <ChevronLeft className="h-5 w-5 text-charcoal" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-charcoal">Meus locais</h1>
        <Link
          href="/eventos/novo"
          aria-label="Cadastrar novo"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white"
        >
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {places.length === 0 && !error && (
        <p className="mt-8 text-center text-sm text-slate">
          Você ainda não cadastrou nenhum local ou evento.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {places.map((place) => (
          <div key={place.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
            <PlaceImage src={place.imageUrl} alt={place.name} className="h-16 w-16 rounded-xl" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-charcoal">{place.name}</p>
              <p className="text-xs text-slate">{PLACE_CATEGORY_LABELS[place.category]}</p>
            </div>
            <Link
              href={`/eventos/${place.id}/editar`}
              aria-label="Editar"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-offwhite text-navy"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              aria-label="Apagar"
              onClick={() => handleDelete(place.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-offwhite text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
