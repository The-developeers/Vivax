import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

interface RegisterInput {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  type?: "COMMON" | "ENTREPRENEUR";
  address?: string;
  addressNumber?: string;
  complement?: string;
  city?: string;
  state?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export async function registerUser({
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
}: RegisterInput) {
  // Verifica se já existe um usuário com esse email ou nome de usuário antes de tentar criar
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existingUser) {
    throw new Error(
      existingUser.email === email ? "EMAIL_ALREADY_IN_USE" : "USERNAME_ALREADY_IN_USE"
    );
  }

  // Nunca salvamos a senha em texto puro — o bcrypt gera um hash irreversível.
  // O número 10 é o "custo" do hash: quanto maior, mais lento e mais seguro.
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      type: type ?? "COMMON",
      address,
      addressNumber,
      complement,
      city,
      state,
    },
  });

  // Nunca devolvemos a senha (nem o hash dela) na resposta da API
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function loginUser({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Mesma mensagem de erro para "email não existe" e "senha errada",
  // para não dar pista a um atacante sobre quais emails estão cadastrados.
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign({ sub: user.id, type: user.type }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  const { password: _password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}