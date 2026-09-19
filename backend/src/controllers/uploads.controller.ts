import { Request, Response } from "express";
import { uploadImage } from "../services/uploads.service";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function create(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Nenhuma imagem enviada." });
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return res.status(400).json({ error: "Formato inválido. Use JPEG, PNG ou WebP." });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return res.status(400).json({ error: "Imagem muito grande (máximo 5MB)." });
  }

  try {
    const url = await uploadImage(file);
    return res.status(201).json({ url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao enviar a imagem." });
  }
}
