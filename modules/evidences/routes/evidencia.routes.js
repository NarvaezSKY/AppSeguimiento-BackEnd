import { Router } from "express";
import evidenciaController from "../controllers/evidencia.controller.js";

const router = Router();

router.post("/", evidenciaController.create);
router.get("/", evidenciaController.getAll);

// ruta para tasks agrupadas por componente (antes /evidencias)
router.get("/tasks", evidenciaController.getTasksGrouped);

// colocar rutas paramétricas al final
router.get("/:id", evidenciaController.getById);

export default router;