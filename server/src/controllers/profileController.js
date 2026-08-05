import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "profilePicture"];
  const values = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k)),
  );
  const user = await User.findByIdAndUpdate(req.user.id, values, {
    new: true,
    runValidators: true,
  });
  res.json({ user });
});
