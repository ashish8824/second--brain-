import express from "express";
import passport from "passport";
import {
  register,
  login,
  getMe,
  forgotPasswordController,
  resetPasswordController,
  googleCallback,
} from "./auth.controller.js";

import validate from "../../middlewares/validate.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const router = express.Router();

// public
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPasswordController,
);

// private
router.get("/me", authMiddleware, getMe);

/**
 * Google OAuth login
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // ✅ REQUIRED
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  googleCallback,
);

export default router;
