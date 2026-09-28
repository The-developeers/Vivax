"use client";

import { useLocalIdSet } from "./useLocalIdSet";

export function useFavoritePlaces() {
  const { ids, toggle, has } = useLocalIdSet("viva_favorite_places");
  return { favoriteIds: ids, toggle, isFavorite: has };
}
