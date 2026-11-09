import { VISIT_XP_REWARD } from "@/hooks/useVisitedPlaces";

// Progressão do explorador calculada a partir das visitas validadas.
// Vive só no front por enquanto (as visitas ficam no localStorage) — quando
// existir um sistema de pontos no backend, essas regras migram pra lá.

export interface Level {
  number: number;
  name: string;
  minXp: number;
}

export const LEVELS: Level[] = [
  { number: 1, name: "Curioso", minXp: 0 },
  { number: 2, name: "Andarilho", minXp: 60 },
  { number: 3, name: "Desbravador", minXp: 150 },
  { number: 4, name: "Explorador", minXp: 250 },
  { number: 5, name: "Aventureiro", minXp: 400 },
  { number: 6, name: "Lenda Local", minXp: 600 },
  { number: 7, name: "Mestre de Teresina", minXp: 900 },
];

export interface Milestone {
  // Quantidade de locais descobertos que completa a missão
  count: number;
  mission: string;
  bonusXp: number;
  badge: string;
  badgeDescription: string;
}

export const MILESTONES: Milestone[] = [
  {
    count: 1,
    mission: "Primeira descoberta",
    bonusXp: 10,
    badge: "Primeiro Passo",
    badgeDescription: "Descobriu seu primeiro local",
  },
  {
    count: 3,
    mission: "3 joias escondidas",
    bonusXp: 50,
    badge: "Caça-Joias",
    badgeDescription: "Descobriu 3 joias escondidas",
  },
  {
    count: 5,
    mission: "5 lugares descobertos",
    bonusXp: 80,
    badge: "Explorador Urbano",
    badgeDescription: "Descobriu 5 lugares da cidade",
  },
  {
    count: 10,
    mission: "10 lugares descobertos",
    bonusXp: 150,
    badge: "Rei do Rolê",
    badgeDescription: "Descobriu 10 lugares da cidade",
  },
  {
    count: 20,
    mission: "20 lugares descobertos",
    bonusXp: 300,
    badge: "Lenda de Teresina",
    badgeDescription: "Descobriu 20 lugares da cidade",
  },
];

export function totalXp(visitedCount: number): number {
  const bonus = MILESTONES.filter((m) => visitedCount >= m.count).reduce(
    (sum, m) => sum + m.bonusXp,
    0
  );
  return visitedCount * VISIT_XP_REWARD + bonus;
}

export function levelFor(xp: number): { level: Level; next: Level | null } {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) index = i;
  }
  return { level: LEVELS[index], next: LEVELS[index + 1] ?? null };
}

export function milestoneReachedAt(visitedCount: number): Milestone | null {
  return MILESTONES.find((m) => m.count === visitedCount) ?? null;
}

export function nextMilestone(visitedCount: number): Milestone | null {
  return MILESTONES.find((m) => m.count > visitedCount) ?? null;
}
