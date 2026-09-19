"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type UserType = "COMMON" | "ENTREPRENEUR";

interface AuthState {
  token: string | null;
  userName: string | null;
  userType: UserType | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, userName: string, userType: UserType, rememberMe: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    token: null,
    userName: null,
    userType: null,
    isLoading: true,
  });

  useEffect(() => {
    // localStorage/sessionStorage só existem no client. Ler aqui (em vez de no
    // useState inicial) mantém a primeira renderização igual à do servidor,
    // evitando erro de hidratação.
    const token = localStorage.getItem("viva_token") ?? sessionStorage.getItem("viva_token");
    const userName = localStorage.getItem("viva_user_name");
    const userType = localStorage.getItem("viva_user_type") as UserType | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ token, userName, userType, isLoading: false });
  }, []);

  function login(token: string, userName: string, userType: UserType, rememberMe: boolean) {
    if (rememberMe) {
      localStorage.setItem("viva_token", token);
    } else {
      sessionStorage.setItem("viva_token", token);
    }
    localStorage.setItem("viva_user_name", userName);
    localStorage.setItem("viva_user_type", userType);
    setState({ token, userName, userType, isLoading: false });
  }

  function logout() {
    localStorage.removeItem("viva_token");
    sessionStorage.removeItem("viva_token");
    localStorage.removeItem("viva_user_name");
    localStorage.removeItem("viva_user_type");
    setState({ token: null, userName: null, userType: null, isLoading: false });
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  return ctx;
}
