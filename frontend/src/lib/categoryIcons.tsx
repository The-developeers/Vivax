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
