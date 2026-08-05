import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";
export const dashboard = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const q = isAdmin ? {} : { candidate: req.user.id };
  const [total, pending, rejected, interviews, recent, notifications] =
    await Promise.all([
      Application.countDocuments(q),
      Application.countDocuments({
        ...q,
        status: {
          $in: [
            "Applied",
            "Resume Under Review",
            "Technical Round",
            "HR Round",
          ],
        },
      }),
      Application.countDocuments({ ...q, status: "Rejected" }),
      Application.countDocuments({ ...q, status: "Interview Scheduled" }),
      Application.find(q)
        .sort("-updatedAt")
        .limit(6)
        .populate("job", "title jobId"),
      Notification.find({ user: req.user.id }).sort("-createdAt").limit(6),
    ]);
  const data = {
    totalApplications: total,
    pending,
    rejected,
    interviews,
    recent,
    notifications,
  };
  if (isAdmin) {
    data.totalCandidates = await (
      await import("../models/User.js")
    ).default.countDocuments({ role: "candidate" });
    data.activeJobs = await Job.countDocuments({ status: "active" });
    data.today = await Application.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
  }
  res.json(data);
});
