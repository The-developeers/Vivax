export interface MockReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

// Comunidade ativa (fotos e avaliações de visitantes reais) ainda não existe —
// isso é conteúdo de exemplo até essa funcionalidade ser construída de verdade.
export const mockReviews: MockReview[] = [
  {
    id: "review-1",
    name: "Marina Alves",
    rating: 5,
    comment: "Lugar incrível pra ir com a família no fim de semana. Recomendo muito!",
  },
  {
    id: "review-2",
    name: "Rafael Costa",
    rating: 4,
    comment: "Ambiente bem cuidado e tranquilo. Só fica lotado no fim de tarde.",
  },
];

const STORAGE_URL = "https://slayezxjtclzldutarwr.supabase.co/storage/v1/object/public/image";

export const mockGalleryPhotos = [
  `${STORAGE_URL}/local_parque_da_cidadania.jpg`,
  `${STORAGE_URL}/local_museu_piaui.jpg`,
  `${STORAGE_URL}/local_bar_do_rufino.webp`,
];
