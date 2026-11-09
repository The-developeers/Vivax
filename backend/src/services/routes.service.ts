// Cálculo de rotas via OpenRouteService (https://openrouteservice.org).
// Plano gratuito: ~2.000 rotas/dia e 40/min — por isso o cache em memória.

export type TravelMode = "foot" | "bike" | "car";

const ORS_PROFILES: Record<TravelMode, string> = {
  foot: "foot-walking",
  bike: "cycling-regular",
  car: "driving-car",
};

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  // Tipo de manobra do ORS (0 = esquerda, 1 = direita, 6 = siga em frente, 10 = chegada...)
  type: number;
}

export interface RouteResult {
  mode: TravelMode;
  distanceMeters: number;
  durationSeconds: number;
  ascentMeters: number;
  // Quanto se sobe no último terço do trajeto — usado pra avisar "subida no final"
  finalClimbMeters: number;
  // [lat, lng] — já no formato que o Leaflet espera
  coordinates: [number, number][];
  steps: RouteStep[];
}

export class RouteError extends Error {
  constructor(
    public code: "NOT_CONFIGURED" | "NO_ROUTE" | "UPSTREAM",
    message: string
  ) {
    super(message);
  }
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;
const cache = new Map<string, { expiresAt: number; value: RouteResult }>();

function cacheKey(mode: TravelMode, from: [number, number], to: [number, number]) {
  // Arredonda a origem em ~100m: quem está "no mesmo lugar" reaproveita a rota
  const round = (n: number) => n.toFixed(3);
  return `${mode}:${round(from[0])},${round(from[1])}:${to[0]},${to[1]}`;
}

function readCache(key: string): RouteResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function writeCache(key: string, value: RouteResult) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
}

interface OrsFeature {
  geometry: { coordinates: number[][] };
  properties: {
    summary?: { distance?: number; duration?: number };
    ascent?: number;
    segments?: {
      steps?: { instruction: string; distance: number; duration: number; type: number }[];
    }[];
  };
}

function climbInFinalThird(coordinates: number[][]): number {
  const start = Math.floor(coordinates.length * (2 / 3));
  let climb = 0;
  for (let i = Math.max(start, 1); i < coordinates.length; i++) {
    const diff = (coordinates[i][2] ?? 0) - (coordinates[i - 1][2] ?? 0);
    if (diff > 0) climb += diff;
  }
  return Math.round(climb);
}

export async function getRoute(
  mode: TravelMode,
  from: [number, number],
  to: [number, number]
): Promise<RouteResult> {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    throw new RouteError("NOT_CONFIGURED", "Cálculo de rotas não configurado (ORS_API_KEY).");
  }

  const key = cacheKey(mode, from, to);
  const cached = readCache(key);
  if (cached) return cached;

  let response: Response;
  try {
    response = await fetch(
      `https://api.openrouteservice.org/v2/directions/${ORS_PROFILES[mode]}/geojson`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
          Accept: "application/geo+json",
        },
        body: JSON.stringify({
          // ORS usa [lng, lat]
          coordinates: [
            [from[1], from[0]],
            [to[1], to[0]],
          ],
          elevation: true,
          instructions: true,
          language: "pt",
          units: "m",
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch (error) {
    console.error("Falha ao chamar o OpenRouteService:", error);
    throw new RouteError("UPSTREAM", "Não foi possível calcular a rota agora.");
  }

  if (!response.ok) {
    const body = await response.text();
    // 404 = não achou rua perto da origem/destino; 400 com código 2004 = distância acima do limite
    if (response.status === 404 || body.includes('"code":2004') || body.includes('"code":2010')) {
      throw new RouteError("NO_ROUTE", "Não encontramos um caminho até esse local.");
    }
    console.error(`OpenRouteService respondeu ${response.status}: ${body}`);
    throw new RouteError("UPSTREAM", "Não foi possível calcular a rota agora.");
  }

  const data = (await response.json()) as { features?: OrsFeature[] };
  const feature = data.features?.[0];
  if (!feature) {
    throw new RouteError("NO_ROUTE", "Não encontramos um caminho até esse local.");
  }

  const coordinates = feature.geometry.coordinates;
  const result: RouteResult = {
    mode,
    distanceMeters: Math.round(feature.properties.summary?.distance ?? 0),
    durationSeconds: Math.round(feature.properties.summary?.duration ?? 0),
    ascentMeters: Math.round(feature.properties.ascent ?? 0),
    finalClimbMeters: climbInFinalThird(coordinates),
    coordinates: coordinates.map(([lng, lat]) => [lat, lng]),
    steps: (feature.properties.segments ?? []).flatMap((segment) =>
      (segment.steps ?? []).map((step) => ({
        instruction: step.instruction,
        distanceMeters: Math.round(step.distance),
        durationSeconds: Math.round(step.duration),
        type: step.type,
      }))
    ),
  };

  writeCache(key, result);
  return result;
}
