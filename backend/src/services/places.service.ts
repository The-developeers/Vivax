import { prisma } from "../lib/prisma";

type PlaceCategory = "EVENTOS" | "GASTRONOMIA" | "LAZER" | "TURISMO";

interface ListPlacesFilters {
  category?: PlaceCategory;
  isFree?: boolean;
  today?: boolean;
}

export async function listPlaces({ category, isFree, today }: ListPlacesFilters) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return prisma.place.findMany({
    where: {
      category,
      isFree: isFree ? true : undefined,
      eventDate: today ? { gte: startOfToday, lte: endOfToday } : undefined,
    },
    orderBy: { name: "asc" },
  });
}

export async function getPlaceById(id: string) {
  return prisma.place.findUnique({ where: { id } });
}
