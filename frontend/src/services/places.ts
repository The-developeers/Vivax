const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type PlaceCategory = "EVENTOS" | "GASTRONOMIA" | "LAZER";

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
}

export async function listPlaces(category?: PlaceCategory): Promise<Place[]> {
  const query = category ? `?category=${category}` : "";
  const response = await fetch(`${API_URL}/places${query}`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os locais.");
  }

  return response.json();
}
