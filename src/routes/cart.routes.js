import { Router } from "express";
import { validateCartController } from "../controllers/cart.controller.js";

const router = Router();

router.post("/validate", validateCartController);

export default router;