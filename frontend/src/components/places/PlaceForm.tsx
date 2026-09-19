"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";
import { ImageIcon } from "lucide-react";
import { uploadImage } from "@/services/uploads";
import { PLACE_CATEGORY_LABELS, type PlaceCategory, type PlaceFormInput } from "@/services/places";

const LocationPicker = dynamic(
  () => import("@/components/map/LocationPicker").then((mod) => mod.LocationPicker),
  { ssr: false }
);

const CATEGORIES = Object.keys(PLACE_CATEGORY_LABELS) as PlaceCategory[];

function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export interface PlaceFormValues {
  name: string;
  description: string;
  category: PlaceCategory;
  isEvent: boolean;
  eventDate: string;
  isFree: boolean;
  openingHours: string;
  address: string;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
}

const EMPTY_VALUES: PlaceFormValues = {
  name: "",
  description: "",
  category: "LAZER",
  isEvent: false,
  eventDate: "",
  isFree: false,
  openingHours: "",
  address: "",
  imageUrl: "",
  latitude: null,
  longitude: null,
};

interface PlaceFormProps {
  initialValues?: Partial<PlaceFormValues>;
  submitLabel: string;
  onSubmit: (input: PlaceFormInput) => Promise<void>;
}

export function PlaceForm({ initialValues, submitLabel, onSubmit }: PlaceFormProps) {
  const [values, setValues] = useState<PlaceFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof PlaceFormValues>(key: K, value: PlaceFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      update("imageUrl", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (values.latitude === null || values.longitude === null) {
      setError("Marque a localização exata no mapa.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: values.name,
        description: values.description,
        category: values.category,
        latitude: values.latitude,
        longitude: values.longitude,
        address: values.address || undefined,
        imageUrl: values.imageUrl || undefined,
        isFree: values.isFree,
        eventDate: values.isEvent && values.eventDate ? new Date(values.eventDate).toISOString() : null,
        openingHours: values.openingHours || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">{error}</p>
      )}

      <label className="flex flex-col gap-1 text-sm text-charcoal">
        Nome
        <input
          type="text"
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className="rounded-full bg-offwhite px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-charcoal">
        Categoria
        <select
          value={values.category}
          onChange={(e) => update("category", e.target.value as PlaceCategory)}
          className="rounded-full bg-offwhite px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {PLACE_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-charcoal">
        Descrição
        <textarea
          required
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className="rounded-2xl bg-offwhite px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-charcoal">
        <input
          type="checkbox"
          checked={values.isEvent}
          onChange={(e) => update("isEvent", e.target.checked)}
        />
        É um evento com data e horário específicos?
      </label>

      {values.isEvent ? (
        <label className="flex flex-col gap-1 text-sm text-charcoal">
          Data e horário do evento
          <input
            type="datetime-local"
            required={values.isEvent}
            value={values.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
            className="rounded-full bg-offwhite px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-sm text-charcoal">
          Horário de funcionamento
          <input
            type="text"
            placeholder="Ex: 08:00h — 18:00h"
            value={values.openingHours}
            onChange={(e) => update("openingHours", e.target.value)}
            className="rounded-full bg-offwhite px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </label>
      )}

      <label className="flex items-center gap-2 text-sm text-charcoal">
        <input
          type="checkbox"
          checked={values.isFree}
          onChange={(e) => update("isFree", e.target.checked)}
        />
        Entrada gratuita
      </label>

      <label className="flex flex-col gap-1 text-sm text-charcoal">
        Endereço
        <input
          type="text"
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          className="rounded-full bg-offwhite px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
        />
      </label>

      <div>
        <p className="mb-1 text-sm text-charcoal">Localização exata</p>
        <LocationPicker
          latitude={values.latitude}
          longitude={values.longitude}
          onChange={(lat, lng) => setValues((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
        />
      </div>

      <div>
        <p className="mb-1 text-sm text-charcoal">Foto</p>
        {values.imageUrl ? (
          <div className="relative h-32 w-full overflow-hidden rounded-2xl">
            <Image src={values.imageUrl} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-32 w-full items-center justify-center rounded-2xl bg-offwhite">
            <ImageIcon className="h-6 w-6 text-slate" />
          </div>
        )}
        <label className="mt-2 inline-block cursor-pointer rounded-full border border-navy px-4 py-2 text-xs font-medium text-navy">
          {uploading ? "Enviando..." : values.imageUrl ? "Trocar foto" : "Escolher foto"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="mt-2 rounded-full bg-navy py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

export { toDateTimeLocal };
