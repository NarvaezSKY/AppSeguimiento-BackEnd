import { Router } from "express";
import evidenciaController from "../controllers/evidencia.controller.js";

const router = Router();

router.post("/", evidenciaController.create);
router.get("/", evidenciaController.getAll);

// ruta para tasks agrupadas por componente (antes /evidencias)

// Obtener actividades existentes en un trimestre
router.get("/actividades/trimestre", evidenciaController.getActividadesByTrimestre);

router.get("/tasks", evidenciaController.getTasksGrouped);

// colocar rutas paramétricas al final

// Ruta para actualizar solo el estado de una evidencia
router.patch("/:id/estado", evidenciaController.updateEstado);

router.get("/:id", evidenciaController.getById);

export default router;