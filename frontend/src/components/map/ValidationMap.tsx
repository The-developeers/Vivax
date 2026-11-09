"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";

type LatLng = { lat: number; lng: number };

const placeIcon = L.divIcon({
  className: "",
  html: `
    <div style="position: relative; width: 30px; height: 40px;">
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="#1d4ed8" />
        <circle cx="15" cy="15" r="6" fill="#0e1943" />
      </svg>
      <span style="position: absolute; left: 26px; top: 4px; white-space: nowrap; border-radius: 9999px; background: #1d4ed8; color: white; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; padding: 2px 8px;">TROFÉU</span>
    </div>
  `,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

const userIcon = L.divIcon({
  className: "",
  html: `
    <div style="position: relative; width: 16px; height: 16px;">
      <div style="position: absolute; inset: -6px; border-radius: 9999px; background: rgba(59,130,246,0.25);"></div>
      <div style="position: absolute; inset: 0; border-radius: 9999px; background: #3B82F6; border: 2px solid white;"></div>
    </div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Enquadra a zona inteira e, se o usuário estiver por perto, ele também.
function FitZone({ place, user, radius }: { place: LatLng; user: LatLng | null; radius: number }) {
  const map = useMap();
  const userLat = user?.lat;
  const userLng = user?.lng;

  useEffect(() => {
    const bounds = L.latLng(place.lat, place.lng).toBounds(radius * 2.4);
    if (userLat !== undefined && userLng !== undefined) {
      const userPoint = L.latLng(userLat, userLng);
      // Só inclui o usuário se ele estiver a menos de 2km — senão a zona vira um ponto
      if (userPoint.distanceTo([place.lat, place.lng]) < 2000) bounds.extend(userPoint);
    }
    map.fitBounds(bounds, { padding: [16, 16], maxZoom: 17 });
  }, [map, place.lat, place.lng, userLat, userLng, radius]);

  return null;
}

export function ValidationMap({
  place,
  user,
  radius,
  inside,
  distanceLabel,
}: {
  place: LatLng;
  user: LatLng | null;
  radius: number;
  inside: boolean;
  distanceLabel: string | null;
}) {
  const zoneColor = inside ? "#2563eb" : "#64748b";

  return (
    <MapContainer
      center={[place.lat, place.lng]}
      zoom={17}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitZone place={place} user={user} radius={radius} />
      <Circle
        center={[place.lat, place.lng]}
        radius={radius}
        pathOptions={{
          color: zoneColor,
          weight: 2,
          dashArray: "6 6",
          fillColor: zoneColor,
          fillOpacity: inside ? 0.18 : 0.08,
        }}
      />
      <Marker position={[place.lat, place.lng]} icon={placeIcon} />
      {user && (
        <Marker position={[user.lat, user.lng]} icon={userIcon}>
          {distanceLabel && (
            <Tooltip permanent direction="bottom" offset={[0, 10]} className="font-semibold">
              {distanceLabel}
            </Tooltip>
          )}
        </Marker>
      )}
    </MapContainer>
  );
}
