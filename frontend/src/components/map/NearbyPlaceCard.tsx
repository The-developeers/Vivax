import Link from "next/link";
import { PlaceImage } from "@/components/dashboard/PlaceImage";
import { CATEGORY_COLORS } from "@/lib/categoryIcons";
import { getOpenStatus } from "@/lib/openingHours";
import { PLACE_CATEGORY_LABELS, type Place } from "@/services/places";

function StatusLine({ place, distanceLabel }: { place: Place; distanceLabel: string }) {
  const status = getOpenStatus(place.openingHours);
  return (
    <p className="truncate text-[11px] text-slate">
      {distanceLabel}
      {status && (
        <>
          {" • "}
          <span className={status.isOpen ? "text-green-700" : "text-red-600"}>
            {status.label}
          </span>
          {" - "}
          {status.hoursLabel}
        </>
      )}
    </p>
  );
}

export function NearbyPreviewCard({
  place,
  distanceLabel,
}: {
  place: Place;
  distanceLabel: string;
}) {
  return (
    <Link href={`/locais/${place.id}`} className="w-36 shrink-0 rounded-2xl bg-white p-2 shadow">
      <PlaceImage src={place.imageUrl} alt={place.name} className="h-20 w-full rounded-xl" />
      <p className="mt-1.5 truncate text-xs font-semibold text-charcoal">{place.name}</p>
      <p className="text-[11px] font-medium" style={{ color: CATEGORY_COLORS[place.category] }}>
        {PLACE_CATEGORY_LABELS[place.category]}
      </p>
      <StatusLine place={place} distanceLabel={distanceLabel} />
    </Link>
  );
}

export function NearbyListItem({
  place,
  distanceLabel,
}: {
  place: Place;
  distanceLabel: string;
}) {
  return (
    <Link href={`/locais/${place.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-2">
      <PlaceImage src={place.imageUrl} alt={place.name} className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-charcoal">{place.name}</p>
        <p className="text-xs font-medium" style={{ color: CATEGORY_COLORS[place.category] }}>
          {PLACE_CATEGORY_LABELS[place.category]}
        </p>
        <StatusLine place={place} distanceLabel={distanceLabel} />
      </div>
    </Link>
  );
}
