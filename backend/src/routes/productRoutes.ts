import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import upload from "../middlewares/multer";
import { productValidationRules, validate } from "../middlewares/validation";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.single("image"),
  productValidationRules(),
  validate,
  createProduct
);

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.put(
  "/:id",
  authenticate,
  upload.single("image"),
  productValidationRules(),
  validate,
  updateProduct
);

router.delete("/:id", authenticate, deleteProduct);

export default router;
