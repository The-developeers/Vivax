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

// "Acontecendo hoje" e "Eventos Populares" ainda são conteúdo de exemplo —
// viram dados reais quando o feed de eventos (RF06) existir. Os locais
// (Lugares perto de você / Descubra por categoria) já vêm da API (RF02/RF03).
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
