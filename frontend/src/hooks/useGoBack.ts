"use client";

import { useRouter } from "next/navigation";

/**
 * Volta para a tela anterior. Se a página foi aberta direto (link colado,
 * nova aba, compartilhamento), não há para onde voltar — então navega para
 * `fallback`, que deve ser a tela "pai" natural.
 */
export function useGoBack(fallback: string) {
  const router = useRouter();

  return function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };
}
