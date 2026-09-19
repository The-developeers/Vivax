const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type PlaceCategory = "EVENTOS" | "GASTRONOMIA" | "LAZER" | "TURISMO";

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
