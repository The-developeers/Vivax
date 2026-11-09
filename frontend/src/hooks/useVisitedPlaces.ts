"use client";

import { useLocalIdSet } from "./useLocalIdSet";

// XP fixo de exemplo — vira um cálculo real quando o sistema de pontos existir.
export const VISIT_XP_REWARD = 30;

// Regras da validação de presença no local
export const VISIT_ZONE_RADIUS_METERS = 100;
export const VISIT_VALIDATION_SECONDS = 30;

export function useVisitedPlaces() {
  const { ids, add, has } = useLocalIdSet("viva_visited_places");
  // Visita só é registrada pela tela de validação (/locais/[id]/validar),
  // e nunca é desfeita — por isso não expõe toggle.
  return { visitedIds: ids, markVisited: add, isVisited: has };
}
