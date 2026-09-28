import { Footprints, Landmark, Moon, ShoppingBag, Theater, TreePine } from "lucide-react";
import type { PlaceCategory } from "@/services/places";

export const CATEGORY_ICONS: Record<PlaceCategory, typeof TreePine> = {
  AR_LIVRE: TreePine,
  VIDA_NOTURNA: Moon,
  CULTURA: Theater,
  COMPRAS: ShoppingBag,
  TRILHAS: Footprints,
  MUSEUS: Landmark,
};

export const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  AR_LIVRE: "#22C55E",
  VIDA_NOTURNA: "#8B5CF6",
  CULTURA: "#F59E0B",
  COMPRAS: "#EC4899",
  TRILHAS: "#3B82F6",
  MUSEUS: "#EF4444",
};
