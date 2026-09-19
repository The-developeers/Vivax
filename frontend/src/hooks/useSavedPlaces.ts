"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "viva_saved_places";

export function useSavedPlaces() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSavedIds(JSON.parse(raw));
    } catch {
      // localStorage indisponível (modo privado etc.) — segue sem persistir.
    }
  }, []);

  function toggle(id: string) {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function isSaved(id: string) {
    return savedIds.includes(id);
  }

  return { savedIds, toggle, isSaved };
}
