// Serviços (funções puras, fora de componentes React) precisam ler o token
// diretamente do storage — não têm acesso ao AuthContext.
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("viva_token") ?? sessionStorage.getItem("viva_token");
}
