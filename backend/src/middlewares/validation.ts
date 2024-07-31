import { body } from "express-validator";

// User Validation Rules
export const userValidationRules = () => {
  return [
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/\d/)
      .withMessage("Password must contain a number")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain a lowercase letter"),
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .matches(/^[A-Za-z0-9_]+$/)
      .withMessage(
        "Username must contain only alphanumeric characters and underscores"
      ),
  ];
};

// Login Validation Rules
export const loginValidationRules = () => {
  return [
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ];
};

// Product Validation Rules
export const productValidationRules = () => {
  return [
    body("name").notEmpty().withMessage("Product name is required"),
    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be a positive number"),
    body("imageUrl")
      .optional()
      .isURL()
      .withMessage("Image URL must be a valid URL"),
  ];
};

// Order Validation Rules
export const orderValidationRules = () => {
  return [
    body("userId").isInt().withMessage("User ID must be an integer"),
    body("productId").isInt().withMessage("Product ID must be an integer"),
    body("quantity")
      .isInt({ gt: 0 })
      .withMessage("Quantity must be a positive integer"),
    body("total")
      .isFloat({ gt: 0 })
      .withMessage("Total must be a positive number"),
    body("status").notEmpty().withMessage("Status is required"),
  ];
};

// Error Handling Middleware
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: any[] = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};
