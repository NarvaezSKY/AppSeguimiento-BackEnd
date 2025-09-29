import { Router } from "express";
import userController from "../controllers/user.controller.js";
import verifyAuth from "../../../utils/auth.verify.js";

const router = Router();

router.post("/register", verifyAuth, userController.register);

// rutas GET
router.get("/", verifyAuth, userController.getAll);
router.get("/by-name/:nombre", verifyAuth, userController.getByName);
router.get("/:id", verifyAuth, userController.getById);

export default router;