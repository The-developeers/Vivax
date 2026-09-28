import {
  Baby,
  Beer,
  CheckCircle2,
  Music,
  Palette,
  Sun,
  Ticket,
  TreePine,
  Utensils,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/gratuit/i, Ticket],
  [/verde|natureza|trilha/i, TreePine],
  [/famíl|família|criança/i, Baby],
  [/manhã|tarde|sol/i, Sun],
  [/noite|bebida|bar/i, Beer],
  [/música|show/i, Music],
  [/arte|cultura/i, Palette],
  [/comida|petisco|gastronom/i, Utensils],
  [/água|rio|cachoeira/i, Waves],
  [/radical|kart|skate|adrenalina/i, Zap],
];

export function getAmenityIcon(label: string): LucideIcon {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(label));
  return match ? match[1] : CheckCircle2;
}
