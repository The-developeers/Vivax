import express from "express";
import { authRoutes } from "./routes/auth.routes";

const app = express();

// Permite que o Express entenda JSON no corpo das requisições (req.body)
app.use(express.json());

app.use(authRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});