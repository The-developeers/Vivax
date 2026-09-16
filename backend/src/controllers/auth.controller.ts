import { Request, Response } from "express";
import { registerUser } from "../services/auth.service";

export async function register(req: Request, res: Response) {
  const { name, email, password, type } = req.body;

  // Validação básica dos campos obrigatórios antes de qualquer processamento
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
  }

  try {
    const user = await registerUser({ name, email, password, type });
    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_IN_USE") {
      return res.status(409).json({ error: "Este email já está cadastrado." });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno ao criar usuário." });
  }
}