import { getStoredToken } from "@/lib/authToken";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadImage(file: File): Promise<string> {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Não foi possível enviar a imagem.");
  }

  return data.url;
}
