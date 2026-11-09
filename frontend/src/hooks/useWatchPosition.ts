"use client";

import { useEffect, useState } from "react";

export interface WatchedPosition {
  lat: number;
  lng: number;
  // Margem de erro do GPS, em metros
  accuracy: number;
}

/**
 * Acompanha a localização do usuário em tempo real (Geolocation.watchPosition).
 * Diferente do useUserLocation, não tem posição padrão: enquanto o GPS não
 * responde, `position` fica null.
 */
export function useWatchPosition(enabled = true) {
  const [position, setPosition] = useState<WatchedPosition | null>(null);
  const [error, setError] = useState<"unsupported" | "denied" | "unavailable" | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("unsupported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
      },
      (err) => {
        setError(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  return { position, error };
}
