import { Router } from "express";
import userController from "../controllers/admin.controller.js";

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/verify", userController.verify);

export default router;