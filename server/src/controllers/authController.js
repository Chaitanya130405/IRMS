import crypto from "crypto";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";
const respond = (user, res, status = 200) =>
  res
    .status(status)
    .json({
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    throw new AppError("Name, email and password are required");
  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already registered", 409);
  const user = await User.create({ name, email, password, phone });
  respond(user, res, 201);
});
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    throw new AppError("Invalid email or password", 401);
  if (user.status !== "active")
    throw new AppError("Account unavailable", 401);
  user.lastLogin = new Date();
  await user.save();
  respond(user, res);
});
export const me = asyncHandler(async (req, res) =>
  res.json({ user: req.user }),
);
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword)))
    throw new AppError("Current password is incorrect", 400);
  if (!req.body.newPassword || req.body.newPassword.length < 8)
    throw new AppError("New password must be at least 8 characters");
  user.password = req.body.newPassword;
  await user.save();
  respond(user, res);
});
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.json({
      message: "If this email exists, a reset link has been sent.",
    });
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save({ validateBeforeSave: false });
  res.json({
    message: "Use the button below to choose a new password.",
    resetToken: process.env.NODE_ENV === "development" ? token : undefined,
  });
});
export const resetPassword = asyncHandler(async (req, res) => {
  const hash = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hash,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");
  if (!user) throw new AppError("Reset token is invalid or expired", 400);
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  respond(user, res);
});
