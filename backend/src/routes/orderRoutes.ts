import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController";
import { orderValidationRules, validate } from "../middlewares/validation";

const router = Router();

router.post("/", authenticate, orderValidationRules(), validate, createOrder);

router.get("/", authenticate, getAllOrders);

router.get("/:id", authenticate, getOrderById);

router.put(
  "/:id/status",
  authenticate,
  orderValidationRules(),
  validate,
  updateOrderStatus
);

export default router;
