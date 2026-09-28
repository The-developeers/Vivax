"use client";

import { useEffect, useState } from "react";

// Centro de Teresina — usado como referência enquanto a localização real do
// usuário não está disponível (permissão negada, sem suporte, ainda carregando).
export const DEFAULT_LOCATION = { lat: -5.089, lng: -42.801 };

export function useUserLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [isPrecise, setIsPrecise] = useState(false);
  const [denied, setDenied] = useState(false);

  function request() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsPrecise(true);
        setDenied(false);
      },
      () => {
        setDenied(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  useEffect(() => {
    // Chama a Geolocation API do navegador (sistema externo) ao montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    request();
  }, []);

  return { location, isPrecise, denied, requestLocation: request };
}
