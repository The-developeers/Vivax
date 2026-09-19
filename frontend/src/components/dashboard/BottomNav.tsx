"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Home, Map, User } from "lucide-react";

const NAV_ITEMS = [
  { key: "inicio", label: "Início", icon: Home, href: "/dashboard" },
  { key: "mapa", label: "Mapa", icon: Map, href: "/mapa" },
  { key: "salvos", label: "Salvos", icon: Bookmark, href: null },
  { key: "perfil", label: "Perfil", icon: User, href: null },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 z-1000 mx-auto flex w-[calc(100%-2rem)] max-w-sm items-center justify-between rounded-full bg-white px-2 py-2 shadow-lg"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {NAV_ITEMS.map(({ key, label, icon: Icon, href }) => {
        const isActive = href !== null && pathname === href;
        const className = `flex flex-1 flex-col items-center gap-0.5 rounded-full px-3 py-2 text-[11px] transition-colors ${
          isActive ? "bg-navy text-white" : "text-slate"
        }`;

        // Salvos e Perfil ainda serão construídos como telas próprias.
        if (href === null) {
          return (
            <button key={key} type="button" aria-label={label} disabled className={className}>
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              {label}
            </button>
          );
        }

        return (
          <Link key={key} href={href} aria-label={label} aria-current={isActive} className={className}>
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
