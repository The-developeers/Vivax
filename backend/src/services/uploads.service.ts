import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = "image";

export async function uploadImage(file: Express.Multer.File): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const extension = file.originalname.split(".").pop() ?? "jpg";
  const path = `places/${randomUUID()}.${extension}`;

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      apikey: SUPABASE_SERVICE_KEY,
      "Content-Type": file.mimetype,
    },
    body: file.buffer,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SUPABASE_UPLOAD_FAILED: ${detail}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
