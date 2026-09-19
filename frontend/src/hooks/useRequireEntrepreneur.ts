"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Usado em páginas de cadastro/edição de locais — exige login E que o
 * usuário seja do tipo ENTREPRENEUR. Usuários comuns são mandados de
 * volta pro dashboard.
 */
export function useRequireEntrepreneur() {
  const { token, userType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace("/login");
    } else if (userType !== "ENTREPRENEUR") {
      router.replace("/dashboard");
    }
  }, [isLoading, token, userType, router]);

  return { isLoading, isAuthorized: Boolean(token) && userType === "ENTREPRENEUR" };
}
