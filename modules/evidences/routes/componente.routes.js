import { Router } from "express";
import componenteController from "../controllers/componente.controller.js";

const router = Router();

router.post("/", componenteController.create);

// rutas específicas primero (evitan conflicto con :id)
router.get("/by-name/:nombre", componenteController.getByName);
router.get("/", componenteController.getAll);

// ruta paramétrica al final
router.get("/:id", componenteController.getById);

export default router;