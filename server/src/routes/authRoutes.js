import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as c from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

// Strict rate limiting for authentication endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slightly more lenient for password reset (user may legitimately retry)
const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: { message: "Too many password reset requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const r = Router();
r.post("/register", authLimiter, c.register);
r.post("/login", authLimiter, c.login);
r.post("/forgot-password", resetLimiter, c.forgotPassword);
r.post("/reset-password/:token", authLimiter, c.resetPassword);
r.get("/me", protect, c.me);
r.patch("/change-password", protect, c.changePassword);
r.post("/logout", protect, c.logout);
export default r;
