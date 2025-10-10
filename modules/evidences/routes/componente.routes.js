import { Router } from "express";
import componenteController from "../controllers/componente.controller.js";
import verifyAuth from "../../../utils/auth.verify.js";


const router = Router();

router.post("/", verifyAuth, componenteController.create);
router.get("/by-user/:userId", verifyAuth, componenteController.getComponentesByUsuario);
router.get("/:id/responsables", verifyAuth, componenteController.getResponsables);
router.get("/by-name/:nombre", verifyAuth, componenteController.getByName);
router.get("/", verifyAuth, componenteController.getAll);
router.get("/:id", verifyAuth, componenteController.getById);

export default router;
