"use client";

import { useLocalIdSet } from "./useLocalIdSet";

export function useSavedPlaces() {
  const { ids, toggle, has } = useLocalIdSet("viva_saved_places");
  return { savedIds: ids, toggle, isSaved: has };
}
