const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type PlaceCategory = "EVENTOS" | "GASTRONOMIA" | "LAZER" | "TURISMO";

export const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  EVENTOS: "Evento",
  GASTRONOMIA: "Gastronomia",
  LAZER: "Lazer",
  TURISMO: "Turismo",
};

export interface PlaceActivity {
  id: string;
  title: string;
  schedule: string;
  imageUrl: string | null;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  imageUrl: string | null;
  rating: number | null;
  isFree: boolean;
  eventDate: string | null;
  openingHours: string | null;
}

export interface PlaceDetail extends Place {
  activities: PlaceActivity[];
}

export interface ListPlacesFilters {
  category?: PlaceCategory;
  isFree?: boolean;
  today?: boolean;
}

export async function listPlaces(filters: ListPlacesFilters = {}): Promise<Place[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.isFree) params.set("isFree", "true");
  if (filters.today) params.set("today", "true");

  const query = params.toString();
  const response = await fetch(`${API_URL}/places${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os locais.");
  }

  return response.json();
}

export async function getPlaceById(id: string): Promise<PlaceDetail | null> {
  const response = await fetch(`${API_URL}/places/${id}`);

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("Não foi possível carregar o local.");
  }

  return response.json();
}
