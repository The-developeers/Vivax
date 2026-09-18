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

const STORAGE_URL = "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image";

export const popularEvents: PopularEvent[] = [
  {
    id: "pop-1",
    title: "Matanzinho Lima",
    date: "26 de Agosto",
    badge: "Sal & Verão",
    imageUrl: `${STORAGE_URL}/evento_sal_e_verao.png`,
  },
  {
    id: "pop-2",
    title: "Mistura do Momento",
    date: "31 de Outubro",
    badge: "Edição especial",
    imageUrl: `${STORAGE_URL}/evento_mistura_do_momento.png`,
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
    imageUrl: `${STORAGE_URL}/local_museu_piaui.jpg`,
  },
  {
    id: "place-2",
    name: "Parque Cidadania",
    category: "Lazer",
    distanceKm: 2.4,
    rating: null,
    isOpen: true,
    imageUrl: `${STORAGE_URL}/local_parque_da_cidadania.jpg`,
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
    imageUrl: `${STORAGE_URL}/local_bar_do_rufino.webp`,
  },
  {
    id: "place-4",
    name: "Kartódromo - Rio Poty",
    category: "Lazer",
    distanceKm: 1.2,
    rating: 5.0,
    isOpen: true,
    imageUrl: `${STORAGE_URL}/local_kart_rio_poty.jpg`,
  },
];

export const categories = ["Eventos", "Gastronomia", "Lazer"] as const;
