"use client";

import { useLocalIdSet } from "./useLocalIdSet";

// XP fixo de exemplo — vira um cálculo real quando o sistema de pontos existir.
export const VISIT_XP_REWARD = 20;

export function useVisitedPlaces() {
  const { ids, toggle, has } = useLocalIdSet("viva_visited_places");
  return { visitedIds: ids, toggle, isVisited: has };
}
