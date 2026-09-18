"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useBackendWarmup } from "@/hooks/useBackendWarmup";

const VIDEO_URL = process.env.NEXT_PUBLIC_LOGIN_VIDEO_URL;
const LOGO_URL = process.env.NEXT_PUBLIC_LOGIN_LOGO_URL;

export function AuthBackground({ children }: { children: ReactNode }) {
  const { ready, isSlow } = useBackendWarmup();

  return (
    <main className="relative flex min-h-screen w-full flex-col">
      {VIDEO_URL && (
        <video
          className="fixed inset-0 h-full w-full object-cover"
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-navy/25 via-navy/50 to-charcoal" />

      <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col items-center px-6 pb-10 pt-14 text-white">
        {LOGO_URL && (
          <Image
            src={LOGO_URL}
            alt="Viva+ — Mais lugares. Mais momentos."
            width={180}
            height={124}
            priority
            className="h-auto w-40 shrink-0"
          />
        )}

        {ready ? (
          children
        ) : (
          <div className="mt-auto flex w-full flex-col items-center gap-3 pb-16 text-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-sm text-white/90">Preparando o Viva+...</p>
            {isSlow && (
              <p className="max-w-55 text-xs text-white/60">
                O servidor está acordando. Isso pode levar até 1 minuto na primeira vez.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
