"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Apple } from "lucide-react";
import { AuthBackground } from "@/components/AuthBackground";
import { useAuth } from "@/contexts/AuthContext";

const GOOGLE_ICON_URL = process.env.NEXT_PUBLIC_GOOGLE_ICON_URL;

export default function WelcomePage() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    // Quem já tem sessão não precisa ver a tela de boas-vindas de novo.
    if (!isLoading && token) {
      router.replace("/dashboard");
    }
  }, [isLoading, token, router]);

  return (
    <AuthBackground>
      <div className="-mx-6 mt-auto w-[calc(100%+3rem)] rounded-t-4xl bg-navy px-6 pb-8 pt-6">
        <h1 className="text-2xl font-bold leading-snug">Ache o point perfeito pra hoje</h1>
        <p className="mt-2 text-sm text-white/70">
          Trilhas, praças, bares e joias escondidas — tudo pertinho, sem precisar entrar.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 block rounded-full bg-blue-600 py-3 text-center text-sm font-semibold text-white"
        >
          Começar a Aventura
        </Link>

        <div className="my-4 flex items-center gap-3 text-xs text-white/50">
          <span className="h-px flex-1 bg-white/20" />
          ou entre rapidinho
          <span className="h-px flex-1 bg-white/20" />
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-offwhite py-3 text-sm font-medium text-charcoal"
        >
          {GOOGLE_ICON_URL && <Image src={GOOGLE_ICON_URL} alt="" width={18} height={18} />}
          Continuar com Google
        </button>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-3 text-sm font-medium text-white"
        >
          <Apple className="h-4 w-4 fill-current" />
          Continuar com a Apple
        </button>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/50">
          Ao continuar, você aceita nossos Termos e nossa Privacidade.
        </p>

        <Link
          href="/login"
          className="mt-3 block text-center text-xs text-white/80 underline-offset-2 hover:underline"
        >
          Já tem uma conta? Entrar com e-mail
        </Link>
      </div>
    </AuthBackground>
  );
}
