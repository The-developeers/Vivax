import { Request, Response } from "express";
import { getPlaceById, listPlaces } from "../services/places.service";

const VALID_CATEGORIES = ["EVENTOS", "GASTRONOMIA", "LAZER", "TURISMO"] as const;
type PlaceCategory = (typeof VALID_CATEGORIES)[number];

function isValidCategory(value: unknown): value is PlaceCategory {
  return typeof value === "string" && (VALID_CATEGORIES as readonly string[]).includes(value);
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
