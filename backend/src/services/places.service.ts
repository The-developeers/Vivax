import { prisma } from "../lib/prisma";

type PlaceCategory = "EVENTOS" | "GASTRONOMIA" | "LAZER";

export async function listPlaces(category?: PlaceCategory) {
  return prisma.place.findMany({
    where: category ? { category } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getPlaceById(id: string) {
  return prisma.place.findUnique({ where: { id } });
}
