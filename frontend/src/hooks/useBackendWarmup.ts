"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const RETRY_DELAY_MS = 3000;
const PING_TIMEOUT_MS = 8000;
const SLOW_WARNING_MS = 8000;

async function pingBackend(): Promise<boolean> {
  if (!API_URL) return true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const response = await fetch(`${API_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Hospedagens gratuitas (ex: Render free tier) suspendem o backend após um
 * tempo sem uso e levam até ~1 minuto para "acordar" na próxima requisição.
 * Este hook faz ping em /health até o servidor responder, para a tela poder
 * mostrar uma splash em vez de deixar o usuário achar que o app quebrou.
 */
export function useBackendWarmup() {
  const [ready, setReady] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => {
      if (!cancelled) setIsSlow(true);
    }, SLOW_WARNING_MS);

    async function warmUp() {
      while (!cancelled) {
        const ok = await pingBackend();
        if (ok) {
          if (!cancelled) setReady(true);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }

    warmUp();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  return { ready, isSlow };
}
