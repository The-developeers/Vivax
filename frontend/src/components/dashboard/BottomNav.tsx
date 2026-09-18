"use client";

import { Home, Images, Map, User } from "lucide-react";

const NAV_ITEMS = [
  { key: "inicio", label: "Início", icon: Home, active: true },
  { key: "mapa", label: "Mapa", icon: Map, active: false },
  { key: "feed", label: "Feed", icon: Images, active: false },
  { key: "perfil", label: "Perfil", icon: User, active: false },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 z-20 mx-auto flex w-[calc(100%-2rem)] max-w-sm items-center justify-between rounded-full bg-navy px-6 py-3 shadow-lg"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {NAV_ITEMS.map(({ key, label, icon: Icon, active }) => (
        <button
          key={key}
          type="button"
          aria-label={label}
          aria-current={active}
          // As demais telas (mapa, feed, perfil) ainda serão construídas.
          disabled={!active}
          className={`flex flex-col items-center gap-1 text-xs ${
            active ? "text-white" : "text-white/40"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
        </button>
      ))}
    </nav>
  );
}
