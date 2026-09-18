import { PlaceImage } from "./PlaceImage";
import type { PopularEvent } from "@/lib/mockDashboard";

export function PopularEventCard({ event }: { event: PopularEvent }) {
  return (
    <div className="w-44 shrink-0">
      <div className="relative h-56 w-full overflow-hidden rounded-2xl">
        <PlaceImage src={event.imageUrl} alt={event.title} className="h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/90 to-transparent p-3">
          <span className="inline-block rounded-full bg-offwhite/90 px-2 py-0.5 text-[10px] font-semibold text-charcoal">
            {event.badge}
          </span>
          <p className="mt-1 text-sm font-semibold text-white">{event.title}</p>
          <p className="text-xs text-white/80">{event.date}</p>
        </div>
      </div>
    </div>
  );
}
