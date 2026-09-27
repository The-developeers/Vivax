export interface PopularEvent {
  id: string;
  title: string;
  date: string;
  badge: string;
  imageUrl: string | null;
}

export interface HiddenTrophy {
  id: string;
  name: string;
  hint: string;
}

export interface RevisitPlace {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ExplorationStats {
  rank: number;
  city: string;
  visitedCount: number;
  totalCount: number;
}

// Todo esse arquivo é dado de exemplo por enquanto — vira real quando o
// sistema de pontos/visitas por usuário (gamificação) existir de verdade.
// "Perto de você" e "Descubra por categoria", no dashboard, já usam a API.
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

export const hiddenTrophy: HiddenTrophy = {
  id: "trophy-1",
  name: "Cachoeira do Poti",
  hint: "Um tesouro escondido esperando por quem topar a aventura.",
};

export const revisitPlaces: RevisitPlace[] = [
  {
    id: "revisit-1",
    name: "Bar do Rufino",
    imageUrl: `${STORAGE_URL}/local_bar_do_rufino.webp`,
  },
  {
    id: "revisit-2",
    name: "Museu do Piauí",
    imageUrl: `${STORAGE_URL}/local_museu_piaui.jpg`,
  },
  {
    id: "revisit-3",
    name: "Kartódromo",
    imageUrl: `${STORAGE_URL}/local_kart_rio_poty.jpg`,
  },
];

export const explorationStats: ExplorationStats = {
  rank: 3,
  city: "Teresina",
  visitedCount: 12,
  totalCount: 50,
};
