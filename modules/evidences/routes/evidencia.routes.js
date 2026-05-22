import { Router } from "express";
import evidenciaController from "../controllers/evidencia.controller.js";
import verifyAuth from "../../../utils/auth.verify.js";

const router = Router();

router.post("/", verifyAuth, evidenciaController.create);
// GET /evidencias
// Query params soportados para filtrado: componente, actividad, mes, anio, estado, responsable, responsables (csv)
// Paginado opcional: page (>=1) y limit (o perPage)
router.get("/", evidenciaController.getAll);

// ruta para tasks agrupadas por componente (antes /evidencias)

// Obtener actividades existentes en un trimestre
router.get("/actividades/trimestre",verifyAuth, evidenciaController.getActividadesByTrimestre);

router.get("/tasks",verifyAuth, evidenciaController.getTasksGrouped);

// colocar rutas paramétricas al final

// Ruta para actualizar solo el estado de una evidencia
router.patch("/:id/estado", verifyAuth,evidenciaController.updateEstado);

// Ruta para actualizar responsables de una evidencia
router.patch("/:id/responsables", verifyAuth, evidenciaController.updateResponsables);

router.get("/:id", verifyAuth,evidenciaController.getById);

export default router;