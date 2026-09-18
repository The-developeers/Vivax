import { Star } from "lucide-react";
import { PlaceImage } from "./PlaceImage";
import type { NearbyPlace } from "@/lib/mockDashboard";

export function PlaceCard({
  place,
  className = "w-40 shrink-0",
}: {
  place: NearbyPlace;
  className?: string;
}) {
  return (
    <div className={className}>
      <PlaceImage src={place.imageUrl} alt={place.name} className="h-24 w-full rounded-xl" />
      <p className="mt-2 truncate text-sm font-medium text-charcoal">{place.name}</p>
      <div className="mt-0.5 flex items-center gap-1 text-xs text-slate">
        <span>{place.distanceKm}km</span>
        {place.rating !== null && (
          <>
            <span>•</span>
            <Star className="h-3 w-3 fill-current" />
            <span>{place.rating.toFixed(1)}</span>
          </>
        )}
        {place.isOpen !== null && (
          <>
            <span>•</span>
            <span className={place.isOpen ? "text-green-700" : "text-red-600"}>
              {place.isOpen ? "Aberto" : "Fechado"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
