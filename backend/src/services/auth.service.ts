import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  type?: "COMMON" | "ENTREPRENEUR";
}

export async function registerUser({ name, email, password, type }: RegisterInput) {
  // Verifica se já existe um usuário com esse email antes de tentar criar
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_IN_USE");
  }

  // Nunca salvamos a senha em texto puro — o bcrypt gera um hash irreversível.
  // O número 10 é o "custo" do hash: quanto maior, mais lento e mais seguro.
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      type: type ?? "COMMON",
    },
  });

  // Nunca devolvemos a senha (nem o hash dela) na resposta da API
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}