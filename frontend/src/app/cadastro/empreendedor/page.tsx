"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AtSign, Building2, Hash, Lock, Mail, MapPin, Phone, Store } from "lucide-react";
import { register } from "@/services/auth";
import { AuthBackground } from "@/components/AuthBackground";
import { FormInput } from "@/components/FormInput";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_HINT =
  "Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.";

export default function CadastroEmpreendedorPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    if (!PASSWORD_RULE.test(password)) {
      setError(PASSWORD_HINT);
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        username,
        email,
        phone,
        password,
        type: "ENTREPRENEUR",
        address,
        addressNumber,
        complement: complement || undefined,
        city,
        state,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthBackground>
      {success ? (
        <div className="mt-auto flex w-full flex-col items-center gap-4 pb-8 text-center">
          <div>
            <p className="text-lg font-semibold">Conta criada com sucesso!</p>
            <p className="mt-1 text-sm text-white/80">Agora você já pode entrar no Viva+.</p>
          </div>
          <Link
            href="/login"
            className="w-full rounded-full bg-navy py-3 text-sm font-semibold text-white"
          >
            Ir para o login
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex w-full flex-1 flex-col pb-8">
          <div className="text-center">
            <h1 className="text-xl font-bold">Cadastro</h1>
            <p className="text-xs text-white/80">Empreendedor Local</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex w-full flex-col gap-3">
            {error && (
              <p className="rounded-lg bg-charcoal/40 px-3 py-2 text-center text-xs text-white">
                {error}
              </p>
            )}

            <FormInput
              icon={Store}
              type="text"
              required
              placeholder="Nome Fantasia"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FormInput
              icon={AtSign}
              type="text"
              required
              placeholder="Nome de Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FormInput
              icon={Mail}
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              icon={Phone}
              type="tel"
              required
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <FormInput
              icon={MapPin}
              type="text"
              required
              placeholder="Endereço"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="flex gap-3">
              <FormInput
                icon={Hash}
                type="text"
                required
                placeholder="Número"
                value={addressNumber}
                onChange={(e) => setAddressNumber(e.target.value)}
              />
              <FormInput
                icon={Building2}
                type="text"
                placeholder="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <FormInput
                type="text"
                required
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <FormInput
                type="text"
                required
                placeholder="Estado"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <div>
              <FormInput
                icon={Lock}
                type="password"
                required
                placeholder="Sua Senha Forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="mt-1 px-2 text-[11px] leading-tight text-white/70">{PASSWORD_HINT}</p>
            </div>
            <FormInput
              icon={Lock}
              type="password"
              required
              placeholder="Repita a Mesma Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-navy py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            >
              {loading ? "Criando..." : "Criar Acesso"}
            </button>

            <Link href="/login" className="text-center text-xs text-white/90 hover:underline">
              Já tem uma conta? Entrar
            </Link>
          </form>
        </div>
      )}
    </AuthBackground>
  );
}
