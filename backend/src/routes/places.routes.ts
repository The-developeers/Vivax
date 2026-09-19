import { Router } from "express";
import { authenticate, requireEntrepreneur } from "../middlewares/auth.middleware";
import { create, index, mine, remove, show, update } from "../controllers/places.controller";

const placesRoutes = Router();

// Rotas públicas — qualquer visitante pode explorar o mapa/perfil de locais
placesRoutes.get("/places", index);
placesRoutes.get("/places/mine", authenticate, requireEntrepreneur, mine);
placesRoutes.get("/places/:id", show);

// Rotas restritas a empreendedores autenticados
placesRoutes.post("/places", authenticate, requireEntrepreneur, create);
placesRoutes.put("/places/:id", authenticate, requireEntrepreneur, update);
placesRoutes.delete("/places/:id", authenticate, requireEntrepreneur, remove);

export { placesRoutes };
