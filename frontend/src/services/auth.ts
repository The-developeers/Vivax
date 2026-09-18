const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type UserType = "COMMON" | "ENTREPRENEUR";

interface LoginPayload {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  type: UserType;
  address: string | null;
  addressNumber: string | null;
  complement: string | null;
  city: string | null;
  state: string | null;
}

interface LoginResponse {
  user: UserResponse;
  token: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  type?: UserType;
  address?: string;
  addressNumber?: string;
  complement?: string;
  city?: string;
  state?: string;
}

async function postJSON<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Não foi possível completar a operação. Tente novamente.");
  }

  return data;
}

export function login(payload: LoginPayload) {
  return postJSON<LoginResponse>("/auth/login", payload);
}

export function register(payload: RegisterPayload) {
  return postJSON<UserResponse>("/auth/register", payload);
}
