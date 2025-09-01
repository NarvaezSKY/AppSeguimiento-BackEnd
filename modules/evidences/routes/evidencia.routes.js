import { Router } from "express";
import evidenciaController from "../controllers/evidencia.controller.js";

const router = Router();

router.post("/", evidenciaController.create);
router.get("/", evidenciaController.getAll);
router.get("/:id", evidenciaController.getById);

export default router;