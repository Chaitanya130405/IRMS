import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (req, res) =>
  res.json({
    notifications: await Notification.find({ user: req.user.id }).sort(
      "-createdAt",
    ),
  }),
);

export const readNotification = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true },
  );
  res.json({ notification: n });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );
  res.json({ message: "All notifications marked as read" });
});

export const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user.id });
  res.json({ message: "All notifications cleared" });
});
