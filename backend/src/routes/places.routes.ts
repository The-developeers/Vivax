import { Router } from "express";
import { index, show } from "../controllers/places.controller";

const placesRoutes = Router();

placesRoutes.get("/places", index);
placesRoutes.get("/places/:id", show);

export { placesRoutes };
