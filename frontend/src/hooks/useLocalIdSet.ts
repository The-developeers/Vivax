"use client";

import { useEffect, useState } from "react";

/**
 * Guarda um conjunto de ids no localStorage do navegador (salvos, favoritos,
 * visitados etc.). Não é sincronizado com o backend — cada aparelho tem o
 * seu próprio conjunto até essas funções virarem contas de verdade.
 */
export function useLocalIdSet(storageKey: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // localStorage indisponível (modo privado etc.) — segue sem persistir.
    }
  }, [storageKey]);

  function update(compute: (prev: string[]) => string[]) {
    setIds((prev) => {
      const next = compute(prev);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // segue sem persistir
      }
      return next;
    });
  }

  function toggle(id: string) {
    update((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
    );
  }

  // Inclui sem nunca remover — pra ações que não devem ser desfeitas por engano.
  function add(id: string) {
    update((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function has(id: string) {
    return ids.includes(id);
  }

  return { ids, toggle, add, has };
}
