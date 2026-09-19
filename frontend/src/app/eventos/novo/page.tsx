"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { PlaceForm } from "@/components/places/PlaceForm";
import { useRequireEntrepreneur } from "@/hooks/useRequireEntrepreneur";
import { createPlace } from "@/services/places";

export default function NovoLocalPage() {
  const { isLoading, isAuthorized } = useRequireEntrepreneur();
  const router = useRouter();

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
        <h1 className="flex-1 text-lg font-bold text-charcoal">Cadastrar local ou evento</h1>
        <Link href="/meus-locais" className="text-xs font-medium text-navy hover:underline">
          Meus locais
        </Link>
      </div>

      <PlaceForm
        submitLabel="Publicar"
        onSubmit={async (input) => {
          const place = await createPlace(input);
          router.push(`/locais/${place.id}`);
        }}
      />
    </div>
  );
}
