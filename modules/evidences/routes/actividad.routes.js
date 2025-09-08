import { Router } from "express";
import actividadController from "../controllers/actividad.controller.js";

const router = Router();
router.post("/", actividadController.create);
router.get("/", actividadController.getAll);
router.get("/:id", actividadController.getById);
export default router;