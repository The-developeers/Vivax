import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export async function register(req: Request, res: Response) {
  const {
    name,
    username,
    email,
    phone,
    password,
    type,
    address,
    addressNumber,
    complement,
    city,
    state,
  } = req.body;

  // Validação básica dos campos obrigatórios antes de qualquer processamento
  if (!name || !username || !email || !phone || !password) {
    return res
      .status(400)
      .json({ error: "Nome, nome de usuário, email, telefone e senha são obrigatórios." });
  }

  if (type === "ENTREPRENEUR" && (!address || !addressNumber || !city || !state)) {
    return res
      .status(400)
      .json({ error: "Endereço, número, cidade e estado são obrigatórios para empreendedores." });
  }

  try {
    const user = await registerUser({
      name,
      username,
      email,
      phone,
      password,
      type,
      address,
      addressNumber,
      complement,
      city,
      state,
    });
    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_IN_USE") {
      return res.status(409).json({ error: "Este email já está cadastrado." });
    }

    if (error instanceof Error && error.message === "USERNAME_ALREADY_IN_USE") {
      return res.status(409).json({ error: "Este nome de usuário já está em uso." });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno ao criar usuário." });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  try {
    const result = await loginUser({ email, password });
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno ao autenticar usuário." });
  }
}