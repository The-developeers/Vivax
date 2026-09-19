"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { PlaceForm, toDateTimeLocal, type PlaceFormValues } from "@/components/places/PlaceForm";
import { useRequireEntrepreneur } from "@/hooks/useRequireEntrepreneur";
import { getPlaceById, updatePlace } from "@/services/places";

export default function EditarLocalPage() {
  const { isLoading: authLoading, isAuthorized } = useRequireEntrepreneur();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [initialValues, setInitialValues] = useState<Partial<PlaceFormValues> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthorized) return;

    getPlaceById(params.id)
      .then((place) => {
        if (!place) {
          setError("Local não encontrado.");
          return;
        }
        setInitialValues({
          name: place.name,
          description: place.description,
          category: place.category,
          isEvent: Boolean(place.eventDate),
          eventDate: toDateTimeLocal(place.eventDate),
          isFree: place.isFree,
          openingHours: place.openingHours ?? "",
          address: place.address ?? "",
          imageUrl: place.imageUrl ?? "",
          latitude: place.latitude,
          longitude: place.longitude,
        });
      })
      .catch(() => setError("Não foi possível carregar este local."));
  }, [params.id, isAuthorized]);

  if (authLoading || !isAuthorized) {
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
        <h1 className="text-lg font-bold text-charcoal">Editar local ou evento</h1>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {initialValues && (
        <PlaceForm
          initialValues={initialValues}
          submitLabel="Salvar alterações"
          onSubmit={async (input) => {
            await updatePlace(params.id, input);
            router.push(`/locais/${params.id}`);
          }}
        />
      )}
    </div>
  );
}
