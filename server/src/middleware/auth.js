import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlacklist from "../models/TokenBlacklist.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token =
    req.headers.authorization?.startsWith("Bearer ") &&
    req.headers.authorization.split(" ")[1];
  if (!token) throw new AppError("Authentication required", 401);

  // Verify JWT signature and expiration
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      throw new AppError("Session expired", 401);
    }
    if (err.name === "JsonWebTokenError") {
      throw new AppError("Invalid token", 401);
    }
    throw new AppError("Authentication failed", 401);
  }

  // Check if token has been blacklisted (user logged out)
  const isBlacklisted = await TokenBlacklist.exists({ token });
  if (isBlacklisted) throw new AppError("Session expired", 401);

  const user = await User.findById(payload.id);
  if (!user || user.status !== "active")
    throw new AppError("Account unavailable", 401);

  req.user = user;
  req.token = token; // Store token for potential logout use
  next();
});

export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : next(new AppError("Access denied", 403));
