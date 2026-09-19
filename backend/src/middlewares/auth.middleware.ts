import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  sub: string;
  type: "COMMON" | "ENTREPRENEUR";
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticação não fornecido." });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

export function requireEntrepreneur(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.type !== "ENTREPRENEUR") {
    return res.status(403).json({ error: "Apenas empreendedores podem realizar essa ação." });
  }
  next();
}
