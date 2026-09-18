export interface FeaturedEvent {
  id: string;
  title: string;
  time: string;
  description: string;
  venue: string;
}

export interface PopularEvent {
  id: string;
  title: string;
  date: string;
  badge: string;
  imageUrl: string | null;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: "Eventos" | "Gastronomia" | "Lazer";
  distanceKm: number;
  rating: number | null;
  isOpen: boolean | null;
  imageUrl: string | null;
}

// Dados de exemplo — trocar por chamadas reais quando RF02/RF03 (mapa e perfil
// de local) tiverem endpoints próprios no backend.
export const featuredEvent: FeaturedEvent = {
  id: "evt-1",
  title: "Show Aurea Tour",
  time: "19:00",
  description: "Música, bebidas e muita diversão para todos os públicos na Arena Chevrolet.",
  venue: "Arena Chevrolet",
};

export const popularEvents: PopularEvent[] = [
  {
    id: "pop-1",
    title: "Matanzinho Lima",
    date: "26 de Agosto",
    badge: "Sal & Verão",
    imageUrl: null,
  },
  {
    id: "pop-2",
    title: "Festival de Verão",
    date: "31 de Outubro",
    badge: "Edição especial",
    imageUrl: null,
  },
];

export const nearbyPlaces: NearbyPlace[] = [
  {
    id: "place-1",
    name: "Museu do Piauí",
    category: "Lazer",
    distanceKm: 1.2,
    rating: 4.3,
    isOpen: null,
    imageUrl: null,
  },
  {
    id: "place-2",
    name: "Parque Cidadania",
    category: "Lazer",
    distanceKm: 2.4,
    rating: null,
    isOpen: true,
    imageUrl: null,
  },
];

export const categoryPlaces: NearbyPlace[] = [
  {
    id: "place-3",
    name: "Bar do Rufino",
    category: "Gastronomia",
    distanceKm: 10.2,
    rating: 4.5,
    isOpen: true,
    imageUrl: null,
  },
  {
    id: "place-4",
    name: "Kartódromo - Rio Poty",
    category: "Lazer",
    distanceKm: 1.2,
    rating: 5.0,
    isOpen: true,
    imageUrl: null,
  },
];

export const categories = ["Eventos", "Gastronomia", "Lazer"] as const;
