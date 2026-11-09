"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Award, Check, Share2, Sparkles, Trophy, X } from "lucide-react";
import { VISIT_XP_REWARD } from "@/hooks/useVisitedPlaces";
import { levelFor, milestoneReachedAt, nextMilestone, totalXp } from "@/lib/progression";
import { sharePlace } from "@/lib/share";

const CONFETTI_COLORS = ["#facc15", "#fb923c", "#f472b6", "#38bdf8", "#4ade80", "#ffffff"];

// Posições "aleatórias" mas determinísticas (sem Math.random no render)
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 7) % 20) / 10,
  duration: 3.2 + ((i * 13) % 20) / 10,
  drift: ((i * 29) % 80) - 40,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  wide: i % 3 === 0,
}));

const STARS = [
  { top: "12%", left: "10%", size: 18, color: "#facc15", delay: 0 },
  { top: "9%", left: "82%", size: 14, color: "#2dd4bf", delay: 0.6 },
  { top: "27%", left: "78%", size: 12, color: "#ffffff", delay: 1.1 },
  { top: "33%", left: "13%", size: 12, color: "#facc15", delay: 0.3 },
  { top: "18%", left: "90%", size: 10, color: "#f472b6", delay: 1.6 },
];

function useCountUp(target: number, durationMs = 900, delayMs = 400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const timeout = setTimeout(() => {
      const step = (time: number) => {
        if (start === null) start = time;
        const progress = Math.min(1, (time - start) / durationMs);
        // ease-out: começa rápido e desacelera no final
        setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [target, durationMs, delayMs]);

  return value;
}

export function DiscoveryCelebration({
  placeId,
  placeName,
  visitedCount,
}: {
  placeId: string;
  placeName: string;
  // Total de locais descobertos já contando este
  visitedCount: number;
}) {
  const xpBefore = totalXp(visitedCount - 1);
  const xpAfter = totalXp(visitedCount);
  const gained = xpAfter - xpBefore;
  const before = levelFor(xpBefore);
  const after = levelFor(xpAfter);
  const leveledUp = after.level.number > before.level.number;
  const milestone = milestoneReachedAt(visitedCount);
  const upcoming = nextMilestone(visitedCount);

  const levelSpan = after.next ? after.next.minXp - after.level.minXp : 1;
  const progressAfter = after.next ? (xpAfter - after.level.minXp) / levelSpan : 1;
  const progressBefore = leveledUp ? 0 : after.next ? (xpBefore - after.level.minXp) / levelSpan : 1;
  const missingXp = after.next ? after.next.minXp - xpAfter : 0;

  const xpCounter = useCountUp(VISIT_XP_REWARD);
  const [barFilled, setBarFilled] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setBarFilled(true), 900);
    return () => clearTimeout(timeout);
  }, []);

  async function handleShare() {
    const result = await sharePlace({
      title: `Descobri ${placeName} no Viva+!`,
      text: `Acabei de descobrir ${placeName} no Viva+ e ganhei +${gained} XP 🏆`,
      url: `${window.location.origin}/locais/${placeId}`,
    });
    if (result === "copied") {
      setShareMessage("Link copiado!");
      setTimeout(() => setShareMessage(null), 2000);
    }
  }

  let progressCaption = "Você chegou ao nível máximo. Lenda!";
  if (leveledUp) progressCaption = `Subiu de nível! Agora você é ${after.level.name} 🎉`;
  else if (after.next && missingXp <= 30) progressCaption = `${missingXp} XP pro próximo nível — quase lá!`;
  else if (after.next) progressCaption = `${missingXp} XP pro nível ${after.next.number}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Local descoberto: ${placeName}`}
      className="fixed inset-0 z-3000 overflow-y-auto overflow-x-hidden bg-linear-to-b from-blue-600 via-blue-800 to-navy text-white"
    >
      {/* Confete e estrelas */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        {CONFETTI.map((piece, i) => (
          <span
            key={i}
            className="animate-confetti absolute top-0 rounded-sm"
            style={
              {
                left: `${piece.left}%`,
                width: piece.wide ? 10 : 6,
                height: piece.wide ? 4 : 10,
                background: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
                "--confetti-drift": `${piece.drift}px`,
              } as React.CSSProperties
            }
          />
        ))}
        {STARS.map((star, i) => (
          <svg
            key={i}
            className="animate-twinkle absolute"
            style={{ top: star.top, left: star.left, animationDelay: `${star.delay}s` }}
            width={star.size}
            height={star.size}
            viewBox="0 0 24 24"
            fill={star.color}
          >
            <path d="M12 2l2.9 6.9L22 9.6l-5.5 4.8L18.2 22 12 18.3 5.8 22l1.7-7.6L2 9.6l7.1-.7z" />
          </svg>
        ))}
      </div>

      <div className="relative mx-auto flex min-h-full max-w-md flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        <div className="flex justify-end">
          <Link
            href={`/locais/${placeId}`}
            aria-label="Fechar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>

        {/* Selo principal */}
        <div className="animate-celebrate-pop relative mx-auto mt-2 flex h-44 w-44 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-white/10" />
          <div className="absolute inset-4 rounded-full bg-white/10" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-amber-300 via-orange-400 to-orange-500 shadow-[0_10px_40px_rgba(251,146,60,0.55)]">
            <Check className="h-14 w-14 text-white" strokeWidth={3} />
          </div>
        </div>

        <h1
          className="animate-celebrate-rise mt-2 text-center text-4xl font-extrabold tracking-tight"
          style={{ animationDelay: "0.2s" }}
        >
          Descoberto!
        </h1>
        <p
          className="animate-celebrate-rise mx-auto mt-2 inline-flex max-w-full items-center gap-1.5 self-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur"
          style={{ animationDelay: "0.3s" }}
        >
          <Trophy className="h-3.5 w-3.5 shrink-0 text-amber-300" />
          <span className="truncate">{placeName} · TROFÉU</span>
        </p>

        {/* XP ganho */}
        <div className="animate-celebrate-rise mt-5 text-center" style={{ animationDelay: "0.4s" }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Você ganhou</p>
          <p className="mt-1 font-extrabold leading-none text-amber-300 drop-shadow-[0_4px_20px_rgba(252,211,77,0.35)]">
            <span className="text-7xl tabular-nums">+{xpCounter}</span>
            <span className="ml-1 text-2xl">XP</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {/* Nível */}
          <div
            className="animate-celebrate-rise rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
            style={{ animationDelay: "0.55s" }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-lg font-bold ring-1 ring-white/20">
                {after.level.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  Nível {after.level.number} · {after.level.name}
                </p>
                <p className="text-xs text-white/70">
                  {after.next ? `${xpAfter} / ${after.next.minXp} XP` : `${xpAfter} XP`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-500 px-2.5 py-1 text-xs font-bold">+{gained}</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-300 to-amber-400 transition-[width] duration-1000 ease-out"
                style={{ width: `${Math.round((barFilled ? progressAfter : progressBefore) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/80">{progressCaption}</p>
          </div>

          {/* Missão */}
          {milestone ? (
            <div
              className="animate-celebrate-rise flex items-center gap-3 rounded-2xl bg-linear-to-r from-indigo-500/60 to-blue-600/40 p-4 ring-1 ring-white/15"
              style={{ animationDelay: "0.7s" }}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Trophy className="h-6 w-6 text-amber-300" />
              </span>
              <div className="min-w-0">
                <span className="inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  Missão completa!
                </span>
                <p className="mt-1 font-bold">{milestone.mission}</p>
                <p className="text-xs font-semibold text-amber-300">+{milestone.bonusXp} XP bônus liberado</p>
              </div>
            </div>
          ) : (
            upcoming && (
              <div
                className="animate-celebrate-rise flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"
                style={{ animationDelay: "0.7s" }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">Próxima missão</p>
                  <p className="font-bold">{upcoming.mission}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-amber-300"
                        style={{ width: `${Math.round((visitedCount / upcoming.count) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/80">
                      {visitedCount}/{upcoming.count}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Selo */}
          {milestone && (
            <div
              className="animate-celebrate-rise flex items-center gap-3 rounded-2xl bg-white p-4 text-charcoal shadow-xl"
              style={{ animationDelay: "0.85s" }}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-orange-500 shadow-md">
                <Award className="h-6 w-6 text-white" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-orange-500">Selo desbloqueado</p>
                <p className="text-lg font-bold leading-tight">{milestone.badge}</p>
                <p className="text-xs text-slate">{milestone.badgeDescription}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-3 pt-6">
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/40 py-3.5 text-sm font-semibold backdrop-blur"
          >
            <Share2 className="h-4 w-4" />
            {shareMessage ?? "Compartilhar"}
          </button>
          <Link
            href="/mapa"
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold text-navy shadow-lg"
          >
            Continuar explorando
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
