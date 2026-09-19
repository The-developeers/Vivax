import { prisma } from "../lib/prisma";

type PlaceCategory = "EVENTOS" | "GASTRONOMIA" | "LAZER" | "TURISMO";

interface ListPlacesFilters {
  category?: PlaceCategory;
  isFree?: boolean;
  today?: boolean;
}

export interface PlaceInput {
  name: string;
  description: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  address?: string;
  imageUrl?: string;
  isFree?: boolean;
  eventDate?: Date | null;
  openingHours?: string;
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
  return prisma.place.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: "asc" } } },
  });
}

export async function listPlacesByOwner(ownerId: string) {
  return prisma.place.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
}

export async function createPlace(ownerId: string, data: PlaceInput) {
  return prisma.place.create({ data: { ...data, ownerId } });
}

export async function updatePlace(id: string, ownerId: string, data: Partial<PlaceInput>) {
  const place = await prisma.place.findUnique({ where: { id } });

  if (!place) {
    throw new Error("NOT_FOUND");
  }

  if (place.ownerId !== ownerId) {
    throw new Error("FORBIDDEN");
  }

  return prisma.place.update({ where: { id }, data });
}

export async function deletePlace(id: string, ownerId: string) {
  const place = await prisma.place.findUnique({ where: { id } });

  if (!place) {
    throw new Error("NOT_FOUND");
  }

  if (place.ownerId !== ownerId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.place.delete({ where: { id } });
}
