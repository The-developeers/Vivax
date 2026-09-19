import cors from "cors";
import express from "express";
import { authRoutes } from "./routes/auth.routes";
import { placesRoutes } from "./routes/places.routes";
import { uploadsRoutes } from "./routes/uploads.routes";

const app = express();

// FRONTEND_URL aceita múltiplas origens separadas por vírgula (dev + produção)
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));

// Permite que o Express entenda JSON no corpo das requisições (req.body)
app.use(express.json());

// Usado pelo frontend para "acordar" o servidor em hospedagens gratuitas
// que suspendem a aplicação após um tempo sem uso.
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(authRoutes);
app.use(placesRoutes);
app.use(uploadsRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});