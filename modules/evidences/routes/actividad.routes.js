import { Router } from "express";
import actividadController from "../controllers/actividad.controller.js";
import verifyAuth from "../../../utils/auth.verify.js";

const router = Router();
router.post("/", verifyAuth, actividadController.create);
router.get("/", verifyAuth, actividadController.getAll);
router.get("/responsable/:userId", verifyAuth, actividadController.getByResponsable);
router.get("/:id", verifyAuth, actividadController.getById);
export default router;