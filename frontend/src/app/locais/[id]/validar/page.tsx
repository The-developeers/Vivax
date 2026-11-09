"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGoBack } from "@/hooks/useGoBack";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  CircleHelp,
  FlaskConical,
  Loader2,
  LocateFixed,
  MapPin,
  RotateCcw,
  Smartphone,
  Star,
  Trophy,
  Navigation,
  SignalLow,
} from "lucide-react";
import {
  useVisitedPlaces,
  VISIT_VALIDATION_SECONDS,
  VISIT_XP_REWARD,
  VISIT_ZONE_RADIUS_METERS,
} from "@/hooks/useVisitedPlaces";
import { useWatchPosition, type WatchedPosition } from "@/hooks/useWatchPosition";
import { haversineDistanceKm } from "@/lib/geo";
import { getPlaceById, type PlaceDetail } from "@/services/places";
import { DiscoveryCelebration } from "@/components/places/DiscoveryCelebration";

const ValidationMap = dynamic(
  () => import("@/components/map/ValidationMap").then((mod) => mod.ValidationMap),
  { ssr: false }
);

// Acima disso o GPS está impreciso demais pra afirmar que a pessoa está no local
// (ex.: computador sem GPS, que localiza só pela rede).
const MAX_ACCURACY_METERS = 150;

// Botões de simulação aparecem só em desenvolvimento, pra testar sem sair de casa.
const IS_DEV = process.env.NODE_ENV === "development";

type Simulation = "inside" | "outside" | null;

function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function formatMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")}km`;
}

function signalBars(accuracy: number): number {
  if (accuracy <= 15) return 4;
  if (accuracy <= 35) return 3;
  if (accuracy <= 75) return 2;
  return 1;
}

function simulatedPosition(place: PlaceDetail, simulation: Exclude<Simulation, null>): WatchedPosition {
  // ~40m ou ~300m ao norte do local
  const offset = simulation === "inside" ? 0.00036 : 0.0027;
  return { lat: place.latitude + offset, lng: place.longitude, accuracy: 8 };
}

export default function ValidateVisitPage() {
  const params = useParams<{ id: string }>();
  const goBack = useGoBack(`/locais/${params.id}`);
  const { visitedIds, isVisited, markVisited } = useVisitedPlaces();

  const [place, setPlace] = useState<PlaceDetail | null | undefined>(undefined);
  const [simulation, setSimulation] = useState<Simulation>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const alreadyVisited = place ? isVisited(place.id) && !justCompleted : false;
  const done = justCompleted || alreadyVisited;

  const { position: gpsPosition, error: gpsError } = useWatchPosition(!done);

  useEffect(() => {
    getPlaceById(params.id)
      .then(setPlace)
      .catch(() => setPlace(null));
  }, [params.id]);

  // Se o app for minimizado ou a aba trocada, a contagem reinicia.
  useEffect(() => {
    function handleVisibility() {
      setPageVisible(document.visibilityState === "visible");
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const position = place && simulation ? simulatedPosition(place, simulation) : gpsPosition;
  const distanceMeters =
    place && position
      ? haversineDistanceKm(position.lat, position.lng, place.latitude, place.longitude) * 1000
      : null;
  const weakSignal = position !== null && position.accuracy > MAX_ACCURACY_METERS;
  const inside =
    distanceMeters !== null && !weakSignal && distanceMeters <= VISIT_ZONE_RADIUS_METERS;
  const counting = inside && pageVisible && !done;
  const placeId = place?.id;

  // Timer: corre só enquanto a pessoa está dentro da zona com o app aberto.
  // Qualquer interrupção (saiu da zona, minimizou) zera a contagem.
  useEffect(() => {
    if (!counting || !placeId) return;
    const startedAt = Date.now();

    const interval = setInterval(() => {
      const seconds = (Date.now() - startedAt) / 1000;
      if (seconds >= VISIT_VALIDATION_SECONDS) {
        clearInterval(interval);
        setElapsed(VISIT_VALIDATION_SECONDS);
        setJustCompleted(true);
        markVisited(placeId);
        navigator.vibrate?.([80, 60, 160]);
        return;
      }
      setElapsed(seconds);
    }, 200);

    return () => {
      clearInterval(interval);
      setElapsed(0);
    };
    // markVisited muda a cada render (vem do hook); placeId + counting bastam.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counting, placeId]);

  if (place === undefined) {
    return <div className="min-h-screen bg-blue-50" />;
  }

  if (place === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mist px-6 text-center">
        <p className="text-sm text-slate">Local não encontrado.</p>
        <Link href="/mapa" className="text-sm font-medium text-navy hover:underline">
          Voltar para o mapa
        </Link>
      </div>
    );
  }

  const shownElapsed = done ? VISIT_VALIDATION_SECONDS : counting ? elapsed : 0;
  const remaining = VISIT_VALIDATION_SECONDS - shownElapsed;
  const progress = shownElapsed / VISIT_VALIDATION_SECONDS;

  const radius = 86;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-b from-blue-50 to-white">
      {justCompleted && (
        <DiscoveryCelebration
          placeId={place.id}
          placeName={place.name}
          visitedCount={Math.max(1, visitedIds.length)}
        />
      )}

      <header className="flex items-center gap-3 px-4 pb-2 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        <button
          type="button"
          aria-label="Voltar"
          onClick={goBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md"
        >
          <ChevronLeft className="h-5 w-5 text-charcoal" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-xs font-medium text-blue-700">
            {done ? "Visita validada" : "Validando visita"}
          </p>
          <h1 className="truncate font-bold text-charcoal">{place.name}</h1>
        </div>
        <button
          type="button"
          aria-label="Como funciona"
          aria-expanded={helpOpen}
          onClick={() => setHelpOpen((open) => !open)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md"
        >
          <CircleHelp className="h-5 w-5 text-charcoal" />
        </button>
      </header>

      {helpOpen && (
        <div className="mx-4 mt-2 rounded-2xl bg-white p-4 text-sm text-charcoal/80 shadow-md">
          <p className="font-semibold text-charcoal">Como funciona a validação?</p>
          <p className="mt-1">
            Pra garantir que você esteve mesmo aqui, o Viva+ confere pelo GPS se você está a até{" "}
            {VISIT_ZONE_RADIUS_METERS} m do local por {VISIT_VALIDATION_SECONDS} segundos seguidos. Sua
            localização não é salva — só usamos ela durante a contagem.
          </p>
        </div>
      )}

      <main className="flex-1 px-4 pb-48">
        {/* Timer */}
        <div className="relative mx-auto mt-4 flex h-72 w-72 items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full ${done ? "bg-green-100/60" : "bg-cyan-100/50"} ${
              counting ? "animate-pulse" : ""
            }`}
          />
          <div className={`absolute inset-6 rounded-full ${done ? "bg-green-100" : "bg-cyan-100/80"}`} />
          <svg className="relative -rotate-90" width="216" height="216" viewBox="0 0 216 216">
            <defs>
              <linearGradient id="timer-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={done ? "#16a34a" : "#0e1943"} />
                <stop offset="100%" stopColor={done ? "#22c55e" : "#2563eb"} />
              </linearGradient>
            </defs>
            <circle cx="108" cy="108" r={radius + 7} fill="white" />
            <circle cx="108" cy="108" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
            <circle
              cx="108"
              cy="108"
              r={radius}
              fill="none"
              stroke="url(#timer-gradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: "stroke-dashoffset 0.2s linear" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            {done ? (
              <>
                <Trophy className="h-12 w-12 text-amber-500" />
                <p className="mt-1 text-2xl font-bold text-green-700">+{VISIT_XP_REWARD} XP</p>
                <p className="text-xs text-slate">{alreadyVisited ? "já conquistado" : "conquistado!"}</p>
              </>
            ) : (
              <>
                <p className="text-5xl font-bold tabular-nums text-charcoal">{formatTimer(remaining)}</p>
                <p className="mt-1 text-sm text-slate">faltam</p>
                <span
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    position ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${position ? "bg-green-600" : "bg-slate-400"}`}
                  />
                  {simulation ? "GPS simulado" : position ? "GPS ativo" : "Sem GPS"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusCard
          done={done}
          alreadyVisited={alreadyVisited}
          inside={inside}
          weakSignal={weakSignal}
          gpsError={gpsError}
          hasPosition={position !== null}
          distanceMeters={distanceMeters}
          accuracy={position?.accuracy ?? null}
          placeId={place.id}
        />

        {/* Mapa da zona */}
        <div className="relative mt-3 h-44 overflow-hidden rounded-2xl shadow-sm">
          <ValidationMap
            place={{ lat: place.latitude, lng: place.longitude }}
            user={position}
            radius={VISIT_ZONE_RADIUS_METERS}
            inside={inside || done}
            distanceLabel={distanceMeters !== null ? formatMeters(distanceMeters) : null}
          />
          <span className="absolute bottom-2 left-2 z-1000 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-charcoal shadow">
            <LocateFixed className="h-3.5 w-3.5 text-blue-600" />
            Zona de validação · {VISIT_ZONE_RADIUS_METERS}m
          </span>
        </div>

        {/* Regras */}
        {!done && (
          <ul className="mt-3 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-charcoal/80">
            <li className="flex items-center gap-2.5">
              <Smartphone className="h-4 w-4 shrink-0 text-amber-600" />
              Deixe o app aberto até o timer zerar
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 shrink-0 text-amber-600" />
              Se você sair da zona, o timer reinicia
            </li>
            <li className="flex items-center gap-2.5">
              <Star className="h-4 w-4 shrink-0 text-amber-600" />
              Ao fim, você conquista +{VISIT_XP_REWARD} XP e desbloqueia o troféu
            </li>
          </ul>
        )}

        {IS_DEV && !done && (
          <div className="mt-3 rounded-2xl border border-dashed border-purple-300 bg-purple-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-purple-700">
              <FlaskConical className="h-3.5 w-3.5" />
              Modo de teste (só aparece em desenvolvimento)
            </p>
            <div className="mt-2 flex gap-2">
              {(
                [
                  ["inside", "Estou no local"],
                  ["outside", "Saí da zona"],
                  [null, "GPS real"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSimulation(value)}
                  className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium ${
                    simulation === value ? "bg-purple-600 text-white" : "bg-white text-purple-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-1000 bg-linear-to-t from-white via-white to-white/0 px-4 pt-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {done ? (
          <>
            <Link
              href={`/locais/${place.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3.5 text-sm font-semibold text-white shadow-lg"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              Voltar para o local
            </Link>
            <Link href="/mapa" className="mt-2 block text-center text-xs font-medium text-blue-700">
              Descobrir outro lugar
            </Link>
          </>
        ) : (
          <>
            <div className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-100 py-3.5 text-sm font-semibold text-navy/70">
              {counting ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-navy/60" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {counting ? "Validando presença..." : "Aguardando você entrar na zona..."}
            </div>
            <p className="mt-2 text-center text-xs text-slate">
              {counting
                ? `Fique aqui só mais ${Math.max(0, Math.ceil(remaining))} segundos e o +${VISIT_XP_REWARD} XP é seu`
                : `A contagem começa quando você estiver a até ${VISIT_ZONE_RADIUS_METERS} m do local`}
            </p>
            <button
              type="button"
              onClick={goBack}
              className="mx-auto mt-1 block text-xs font-medium text-blue-700 underline"
            >
              cancelar
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

function StatusCard({
  done,
  alreadyVisited,
  inside,
  weakSignal,
  gpsError,
  hasPosition,
  distanceMeters,
  accuracy,
  placeId,
}: {
  done: boolean;
  alreadyVisited: boolean;
  inside: boolean;
  weakSignal: boolean;
  gpsError: string | null;
  hasPosition: boolean;
  distanceMeters: number | null;
  accuracy: number | null;
  placeId: string;
}) {
  let icon = <Loader2 className="h-5 w-5 animate-spin text-slate" />;
  let iconBg = "bg-slate-100";
  let title = "Procurando sua localização...";
  let subtitle: React.ReactNode = "Isso leva só alguns segundos.";

  if (done) {
    icon = <Check className="h-5 w-5 text-green-700" strokeWidth={3} />;
    iconBg = "bg-green-100";
    title = alreadyVisited ? "Você já descobriu esse lugar!" : "Visita validada!";
    subtitle = alreadyVisited
      ? "Esse troféu já está na sua coleção."
      : "Troféu desbloqueado e XP adicionado.";
  } else if (gpsError && !hasPosition) {
    icon = <MapPin className="h-5 w-5 text-red-600" />;
    iconBg = "bg-red-100";
    title = gpsError === "denied" ? "Localização bloqueada" : "Não conseguimos te localizar";
    subtitle =
      gpsError === "denied"
        ? "Permita o acesso à localização nas configurações do navegador pra validar a visita."
        : "Verifique se o GPS do aparelho está ligado.";
  } else if (weakSignal) {
    icon = <SignalLow className="h-5 w-5 text-amber-600" />;
    iconBg = "bg-amber-100";
    title = "Sinal de GPS fraco";
    subtitle = "Vá pra um lugar mais aberto ou ligue o GPS de alta precisão.";
  } else if (inside) {
    icon = <Check className="h-5 w-5 text-green-700" strokeWidth={3} />;
    iconBg = "bg-green-100";
    title = "Você chegou!";
    subtitle = null;
  } else if (distanceMeters !== null) {
    icon = <Navigation className="h-5 w-5 text-blue-700" />;
    iconBg = "bg-blue-100";
    title = `Você está a ${formatMeters(distanceMeters)} do local`;
    subtitle = (
      <Link href={`/locais/${placeId}/rota`} className="font-medium text-blue-700 underline">
        Ver rota até aqui
      </Link>
    );
  }

  const bars = accuracy !== null && !done ? signalBars(accuracy) : 0;

  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-charcoal">{title}</p>
        {subtitle && <p className="text-xs text-slate">{subtitle}</p>}
      </div>
      {bars > 0 && (
        <div className="flex items-end gap-0.5" aria-label={`Sinal de GPS: ${bars} de 4`}>
          {[1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`w-1 rounded-sm ${level <= bars ? "bg-green-600" : "bg-slate-200"}`}
              style={{ height: `${level * 4 + 2}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
