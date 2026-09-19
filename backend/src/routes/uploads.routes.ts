import { Router } from "express";
import multer from "multer";
import { authenticate, requireEntrepreneur } from "../middlewares/auth.middleware";
import { create } from "../controllers/uploads.controller";

const upload = multer({ storage: multer.memoryStorage() });
const uploadsRoutes = Router();

uploadsRoutes.post(
  "/uploads",
  authenticate,
  requireEntrepreneur,
  upload.single("file"),
  create
);

export { uploadsRoutes };
