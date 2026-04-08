import { Router } from "express";
import {
  createPaypalOrderController,
  capturePaypalOrderController
} from "../controllers/checkout.controller.js";

const router = Router();

router.post("/paypal/create-order", createPaypalOrderController);
router.post("/paypal/capture-order", capturePaypalOrderController);

export default router;