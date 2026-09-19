import { Request, Response } from "express";
import {
  createPlace,
  deletePlace,
  getPlaceById,
  listPlaces,
  listPlacesByOwner,
  updatePlace,
  type PlaceInput,
} from "../services/places.service";

const VALID_CATEGORIES = ["EVENTOS", "GASTRONOMIA", "LAZER", "TURISMO"] as const;
type PlaceCategory = (typeof VALID_CATEGORIES)[number];

function isValidCategory(value: unknown): value is PlaceCategory {
  return typeof value === "string" && (VALID_CATEGORIES as readonly string[]).includes(value);
}

function parsePlaceInput(body: Record<string, unknown>): PlaceInput | { error: string } {
  const { name, description, category, latitude, longitude, address, imageUrl, isFree, eventDate, openingHours } =
    body;

  if (typeof name !== "string" || !name.trim()) {
    return { error: "Nome é obrigatório." };
  }
  if (typeof description !== "string" || !description.trim()) {
    return { error: "Descrição é obrigatória." };
  }
  if (!isValidCategory(category)) {
    return { error: `Categoria inválida. Use uma de: ${VALID_CATEGORIES.join(", ")}.` };
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { error: "Latitude inválida." };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { error: "Longitude inválida." };
  }

  let parsedEventDate: Date | null | undefined;
  if (eventDate === null || eventDate === undefined || eventDate === "") {
    parsedEventDate = null;
  } else {
    const date = new Date(eventDate as string);
    if (Number.isNaN(date.getTime())) {
      return { error: "Data do evento inválida." };
    }
    parsedEventDate = date;
  }

  return {
    name: name.trim(),
    description: description.trim(),
    category,
    latitude: lat,
    longitude: lng,
    address: typeof address === "string" ? address.trim() : undefined,
    imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
    isFree: Boolean(isFree),
    eventDate: parsedEventDate,
    openingHours: typeof openingHours === "string" ? openingHours.trim() : undefined,
  };
}

export async function index(req: Request, res: Response) {
  const { category, isFree, today } = req.query;

  if (category !== undefined && !isValidCategory(category)) {
    return res.status(400).json({
      error: `Categoria inválida. Use uma de: ${VALID_CATEGORIES.join(", ")}.`,
    });
  }

  const places = await listPlaces({
    category: category as PlaceCategory | undefined,
    isFree: isFree === "true",
    today: today === "true",
  });
  return res.status(200).json(places);
}

export async function show(req: Request, res: Response) {
  const place = await getPlaceById(req.params.id as string);

  if (!place) {
    return res.status(404).json({ error: "Local não encontrado." });
  }

  return res.status(200).json(place);
}

export async function mine(req: Request, res: Response) {
  const places = await listPlacesByOwner(req.auth!.sub);
  return res.status(200).json(places);
}

export async function create(req: Request, res: Response) {
  const input = parsePlaceInput(req.body);

  if ("error" in input) {
    return res.status(400).json({ error: input.error });
  }

  try {
    const place = await createPlace(req.auth!.sub, input);
    return res.status(201).json(place);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: "Já existe um local com esse nome." });
    }
    console.error(error);
    return res.status(500).json({ error: "Erro ao cadastrar o local." });
  }
}

export async function update(req: Request, res: Response) {
  const input = parsePlaceInput(req.body);

  if ("error" in input) {
    return res.status(400).json({ error: input.error });
  }

  try {
    const place = await updatePlace(req.params.id as string, req.auth!.sub, input);
    return res.status(200).json(place);
  } catch (error) {
    return handleOwnershipError(error, res, "atualizar");
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await deletePlace(req.params.id as string, req.auth!.sub);
    return res.status(204).send();
  } catch (error) {
    return handleOwnershipError(error, res, "apagar");
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

function handleOwnershipError(error: unknown, res: Response, action: string) {
  if (error instanceof Error && error.message === "NOT_FOUND") {
    return res.status(404).json({ error: "Local não encontrado." });
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return res.status(403).json({ error: "Você só pode editar ou apagar locais que você mesmo cadastrou." });
  }
  console.error(error);
  return res.status(500).json({ error: `Erro ao ${action} o local.` });
}
