import User from "../models/User.js";
import Job from "../models/Job.js";
import ActivityLog from "../models/ActivityLog.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listManagedUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "admin" })
    .select("name email phone role status createdAt lastLogin")
    .sort("-createdAt");
  const ids = users.map((user) => user._id);
  const [jobCounts, activity] = await Promise.all([
    Job.aggregate([
      { $match: { createdBy: { $in: ids } } },
      { $group: { _id: "$createdBy", count: { $sum: 1 } } },
    ]),
    ActivityLog.aggregate([
      { $match: { actor: { $in: ids } } },
      {
        $group: {
          _id: "$actor",
          actions: { $sum: 1 },
          lastActivity: { $max: "$createdAt" },
        },
      },
    ]),
  ]);
  const jobsByAdmin = new Map(jobCounts.map((item) => [String(item._id), item.count]));
  const activityByAdmin = new Map(activity.map((item) => [String(item._id), item]));
  res.json({
    users: users.map((user) => ({
      ...user.toObject(),
      jobsCreated: jobsByAdmin.get(String(user._id)) || 0,
      actionsTaken: activityByAdmin.get(String(user._id))?.actions || 0,
      lastActivity: activityByAdmin.get(String(user._id))?.lastActivity || null,
    })),
  });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    throw new AppError("Name, email and password are required");
  if (password.length < 8)
    throw new AppError("Password must be at least 8 characters");
  if (await User.findOne({ email }))
    throw new AppError("Email already registered", 409);

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "admin",
    status: "inactive",
  });
  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["active", "inactive"].includes(status))
    throw new AppError("Status must be active or inactive");

  const user = await User.findOne({
    _id: req.params.id,
    role: "admin",
  });
  if (!user) throw new AppError("User not found", 404);

  user.status = status;
  await user.save();
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
});
