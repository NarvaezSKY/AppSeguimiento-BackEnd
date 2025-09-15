import { Router } from "express";
import componenteController from "../controllers/componente.controller.js";

const router = Router();

router.post("/", componenteController.create);
router.get("/:id/responsables", componenteController.getResponsables);
router.get("/by-name/:nombre", componenteController.getByName);
router.get("/", componenteController.getAll);
router.get("/:id", componenteController.getById);

export default router;
