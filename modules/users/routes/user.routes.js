import { Router } from "express";
import userController from "../controllers/user.controller.js";

const router = Router();

router.post("/register", userController.register);

// rutas GET
router.get("/", userController.getAll);
router.get("/by-name/:nombre", userController.getByName);
router.get("/:id", userController.getById);

export default router;