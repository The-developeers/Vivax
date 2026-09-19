"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Lock, User } from "lucide-react";
import { login as loginRequest } from "@/services/auth";
import { AuthBackground } from "@/components/AuthBackground";
import { FormInput } from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";

const GOOGLE_ICON_URL = process.env.NEXT_PUBLIC_GOOGLE_ICON_URL;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, token } = await loginRequest({ email: identifier, password });
      login(token, user.name, user.type, rememberMe);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      <form onSubmit={handleSubmit} className="mt-auto flex w-full flex-col gap-4 pb-8">
          {error && (
            <p className="rounded-lg bg-charcoal/40 px-3 py-2 text-center text-xs text-white">
              {error}
            </p>
          )}

          <FormInput
            icon={User}
            type="text"
            required
            placeholder="E-mail ou Nome de Usuário"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <FormInput
            icon={Lock}
            type="password"
            required
            placeholder="Sua Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-xs text-white/90">
            <label className="inline-flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <span className="relative h-5 w-9 rounded-full bg-white/30 transition-colors peer-checked:bg-navy">
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    rememberMe ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
              Lembrar Acesso
            </label>

            <button type="button" className="hover:underline">
              Esqueci a Senha
            </button>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full bg-offwhite py-3 text-sm font-medium text-charcoal"
          >
            {GOOGLE_ICON_URL && <Image src={GOOGLE_ICON_URL} alt="" width={18} height={18} />}
            Logar com conta Google
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-navy py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Acessar Viva+"}
          </button>

          <Link href="/cadastro" className="text-center text-xs text-white/90 hover:underline">
            Criar Conta
          </Link>
      </form>
    </AuthBackground>
  );
}
