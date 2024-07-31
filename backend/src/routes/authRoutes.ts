import express from "express";
import {
  loginValidationRules,
  userValidationRules,
  validate,
} from "../middlewares/validation";
import {
  getAllUsers,
  loginUser,
  registerUser,
} from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.post("/register", userValidationRules(), validate, registerUser);

router.post("/login", loginValidationRules(), validate, loginUser);

router.get("/all-users", authenticate, getAllUsers);

export default router;
