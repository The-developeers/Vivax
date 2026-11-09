"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGoBack } from "@/hooks/useGoBack";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  Bike,
  BusFront,
  CarFront,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  CornerUpRight,
  ExternalLink,
  Flag,
  Footprints,
  Loader2,
  MapPin,
  Navigation,
  Play,
  RotateCw,
  TriangleAlert,
  Trophy,
  Undo2,
  type LucideProps,
} from "lucide-react";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useVisitedPlaces, VISIT_XP_REWARD, VISIT_ZONE_RADIUS_METERS } from "@/hooks/useVisitedPlaces";
import { useWatchPosition } from "@/hooks/useWatchPosition";
import { haversineDistanceKm } from "@/lib/geo";
import {
  getPlaceById,
  getPlaceRoute,
  type PlaceDetail,
  type PlaceRoute,
  type RouteStep,
  type TravelMode,
} from "@/services/places";

const RouteMap = dynamic(() => import("@/components/map/RouteMap").then((mod) => mod.RouteMap), {
  ssr: false,
});

type TabMode = TravelMode | "bus";

const TABS: { mode: TabMode; label: string; icon: ComponentType<LucideProps> }[] = [
  { mode: "foot", label: "a pé", icon: Footprints },
  { mode: "bike", label: "de bike", icon: Bike },
  { mode: "car", label: "de carro", icon: CarFront },
  { mode: "bus", label: "de ônibus", icon: BusFront },
];

const ROUTED_MODES: TravelMode[] = ["foot", "bike", "car"];

const GOOGLE_TRAVEL_MODES: Record<TabMode, string> = {
  foot: "walking",
  bike: "bicycling",
  car: "driving",
  bus: "transit",
};

type RouteState =
  | { status: "loading" }
  | { status: "ready"; route: PlaceRoute }
  | { status: "error"; message: string };

// Tipos de manobra do OpenRouteService → ícone
const STEP_ICONS: Record<number, ComponentType<LucideProps>> = {
  0: CornerUpLeft,
  1: CornerUpRight,
  2: ArrowLeft,
  3: ArrowRight,
  4: ArrowUpLeft,
  5: ArrowUpRight,
  6: ArrowUp,
  7: RotateCw,
  8: RotateCw,
  9: Undo2,
  10: Flag,
  11: Navigation,
  12: ArrowUpLeft,
  13: ArrowUpRight,
};

function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${String(minutes).padStart(2, "0")}min`;
}

function formatShortDuration(seconds: number): string {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

function formatMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function terrainLabel(route: PlaceRoute, mode: TravelMode): string | null {
  if (mode === "car") return null;
  if (route.finalClimbMeters >= 25) return "muita subida no final";
  if (route.ascentMeters >= 60) return "trajeto com subidas";
  if (route.ascentMeters < 15) return "trajeto plano";
  return null;
}

// Dicas simples a partir do trajeto e do horário — Teresina é quente o ano todo.
function routeTip(route: PlaceRoute, mode: TravelMode, now: number): string | null {
  if (mode === "car") return null;
  const longTrip = route.durationSeconds >= 40 * 60;
  const hour = new Date(now).getHours();
  const arrivalHour = new Date(now + route.durationSeconds * 1000).getHours();
  const underStrongSun = (hour >= 10 && hour < 16) || (arrivalHour >= 10 && arrivalHour < 16);

  if (longTrip && underStrongSun) {
    return "Leva água e protetor solar — o trajeto é longo e o sol pega forte entre 10h e 16h.";
  }
  if (route.finalClimbMeters >= 25) {
    return "Guarda energia: o último trecho tem bastante subida.";
  }
  if (longTrip) {
    return "Trajeto longo — leva uma garrafinha de água.";
  }
  return null;
}

// Mostra só os trechos que importam: some com as micro-manobras de poucos metros.
function mainSteps(steps: RouteStep[]): RouteStep[] {
  return steps.filter((step) => step.type === 10 || step.distanceMeters >= 30);
}

export default function PlaceRoutePage() {
  const params = useParams<{ id: string }>();
  const goBack = useGoBack(`/locais/${params.id}`);
  const { location, isPrecise, denied, requestLocation } = useUserLocation();

  const [place, setPlace] = useState<PlaceDetail | null | undefined>(undefined);
  const [mode, setMode] = useState<TabMode>("foot");
  const [routes, setRoutes] = useState<Record<TravelMode, RouteState>>({
    foot: { status: "loading" },
    bike: { status: "loading" },
    car: { status: "loading" },
  });
  const [now, setNow] = useState(() => Date.now());
  const { isVisited } = useVisitedPlaces();
  // Acompanha a pessoa durante o trajeto pra avisar quando ela chegar
  const { position: livePosition } = useWatchPosition();

  // Só calcula a rota depois que a localização resolveu (precisa ou negada),
  // pra não gastar chamadas com o ponto padrão e logo depois com o real.
  const locationReady = isPrecise || denied;

  useEffect(() => {
    getPlaceById(params.id)
      .then(setPlace)
      .catch(() => setPlace(null));
  }, [params.id]);

  useEffect(() => {
    if (!locationReady) return;
    let cancelled = false;

    for (const travelMode of ROUTED_MODES) {
      getPlaceRoute(params.id, travelMode, location)
        .then((route) => {
          if (!cancelled) setRoutes((prev) => ({ ...prev, [travelMode]: { status: "ready", route } }));
        })
        .catch((error: Error) => {
          if (!cancelled) {
            setRoutes((prev) => ({ ...prev, [travelMode]: { status: "error", message: error.message } }));
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [params.id, location, locationReady]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (place === undefined) {
    return <div className="min-h-screen bg-mist" />;
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

  const selected = mode === "bus" ? null : routes[mode];
  const route = selected?.status === "ready" ? selected.route : null;
  const tabInfo = TABS.find((tab) => tab.mode === mode)!;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=${GOOGLE_TRAVEL_MODES[mode]}`;
  // Margem um pouco maior que a zona de validação: avisa já na chegada
  const arrived =
    livePosition !== null &&
    !isVisited(place.id) &&
    haversineDistanceKm(livePosition.lat, livePosition.lng, place.latitude, place.longitude) * 1000 <=
      VISIT_ZONE_RADIUS_METERS * 1.5;

  function startRoute() {
    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-mist">
      <div className="absolute inset-0">
        <RouteMap
          origin={location}
          destination={{ lat: place.latitude, lng: place.longitude }}
          destinationName={place.name}
          category={place.category}
          path={route?.coordinates ?? null}
        />
      </div>

      <div className="absolute inset-x-0 top-0 z-1000 flex items-start gap-2 p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        <button
          type="button"
          aria-label="Voltar"
          onClick={goBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md"
        >
          <ChevronLeft className="h-5 w-5 text-charcoal" />
        </button>
        <div className="flex-1 overflow-hidden rounded-2xl bg-white px-4 py-2 shadow-md">
          <div className="flex items-center gap-2.5 py-1.5 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
            {isPrecise ? (
              <span className="text-charcoal">Sua localização</span>
            ) : (
              <button
                type="button"
                onClick={requestLocation}
                className="truncate text-left text-slate underline decoration-dotted"
              >
                {denied ? "Centro de Teresina · ativar localização" : "Buscando sua localização..."}
              </button>
            )}
          </div>
          <div className="ml-1 h-px bg-black/5" />
          <div className="flex items-center gap-2.5 py-1.5 text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-500" />
            <span className="truncate font-semibold text-charcoal">{place.name}</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-1000 flex max-h-[62vh] flex-col rounded-t-3xl bg-white shadow-2xl pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-black/10" />

        <div className="flex-1 overflow-y-auto px-5 pt-4">
          {arrived && (
            <Link
              href={`/locais/${place.id}/validar`}
              className="mb-4 flex items-center gap-3 rounded-2xl bg-linear-to-r from-green-600 to-emerald-500 p-3.5 text-white shadow-lg"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Trophy className="h-5 w-5 text-amber-300" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">Você chegou!</span>
                <span className="block text-xs text-white/90">
                  Valide sua visita e ganhe +{VISIT_XP_REWARD} XP
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0" />
            </Link>
          )}

          <div className="grid grid-cols-4 gap-2">
            {TABS.map(({ mode: tabMode, icon: Icon }) => {
              const active = tabMode === mode;
              const state = tabMode === "bus" ? null : routes[tabMode];
              let label = "Maps";
              if (state?.status === "loading") label = "...";
              if (state?.status === "error") label = "—";
              if (state?.status === "ready") label = formatShortDuration(state.route.durationSeconds);

              return (
                <button
                  key={tabMode}
                  type="button"
                  onClick={() => setMode(tabMode)}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                    active ? "bg-navy text-white" : "bg-offwhite text-charcoal"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              );
            })}
          </div>

          {mode === "bus" && (
            <div className="mt-4">
              <p className="text-xl font-bold text-charcoal">De ônibus</p>
              <p className="mt-1 text-sm text-slate">
                Os horários e linhas de ônibus vêm do Google Maps. Toque em &quot;Iniciar rota&quot; pra ver as
                opções de transporte público até {place.name}.
              </p>
            </div>
          )}

          {selected?.status === "loading" && (
            <div className="flex items-center gap-2 py-8 text-sm text-slate">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando a melhor rota...
            </div>
          )}

          {selected?.status === "error" && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {selected.message}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 font-semibold underline"
              >
                Abrir no Google Maps <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {route && mode !== "bus" && (
            <RouteSummary route={route} mode={mode} modeLabel={tabInfo.label} now={now} />
          )}
        </div>

        <div className="shrink-0 px-5 pt-3">
          <button
            type="button"
            onClick={startRoute}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-blue-700 to-navy py-3.5 text-sm font-semibold text-white shadow-lg"
          >
            <Play className="h-4 w-4 fill-current" />
            Iniciar rota
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function RouteSummary({
  route,
  mode,
  modeLabel,
  now,
}: {
  route: PlaceRoute;
  mode: TravelMode;
  modeLabel: string;
  now: number;
}) {
  const terrain = terrainLabel(route, mode);
  const tip = routeTip(route, mode, now);
  const steps = mainSteps(route.steps);

  return (
    <>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-charcoal">
            {formatDuration(route.durationSeconds)} {modeLabel}
          </p>
          <p className="mt-0.5 text-sm text-slate">
            {formatMeters(route.distanceMeters)}
            {terrain && ` · ${terrain}`}
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-green-100 px-3 py-1.5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">Chega às</p>
          <p className="text-lg font-bold leading-tight text-green-800">
            {formatClock(now + route.durationSeconds * 1000)}
          </p>
        </div>
      </div>

      {tip && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {tip}
        </div>
      )}

      {steps.length > 0 && (
        <>
          <h2 className="mt-5 font-bold text-charcoal">Principais trechos</h2>
          <ol className="mt-2 divide-y divide-black/5 pb-2">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[step.type] ?? ArrowUp;
              return (
                <li key={index} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal">{step.instruction}</p>
                    {step.type !== 10 && (
                      <p className="text-xs text-slate">
                        {formatMeters(step.distanceMeters)} · ~{formatDuration(step.durationSeconds)}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </>
  );
}
