"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Usado em páginas que exigem login. Enquanto a checagem inicial do
 * localStorage/sessionStorage não termina, isLoading fica true (evita
 * redirecionar precocemente ou piscar conteúdo protegido).
 */
export function useRequireAuth() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  return { isLoading, isAuthenticated: Boolean(token) };
}
