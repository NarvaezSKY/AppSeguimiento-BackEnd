import { Router } from "express";
import actividadController from "../controllers/actividad.controller.js";

const router = Router();
router.post("/", actividadController.create);
router.get("/", actividadController.getAll);
router.get("/responsable/:userId", actividadController.getByResponsable);
router.get("/:id", actividadController.getById);
export default router;