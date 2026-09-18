import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/auth/register", register);
authRoutes.post("/auth/login", login);

export { authRoutes };