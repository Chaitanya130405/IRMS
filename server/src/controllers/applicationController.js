import Application from "../models/Application.js";
import Referral from "../models/Referral.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import ActivityLog from "../models/ActivityLog.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { notify } from "../services/notificationService.js";
const populated = (query) =>
  query
    .populate("candidate", "name email phone profilePicture")
    .populate("job")
    .populate("referral");
export const createApplication = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("Resume is required");
  const { job, referral, coverLetter, additionalNotes } = req.body;
  const exists = await Application.findOne({ candidate: req.user.id, job });
  if (exists) throw new AppError("You have already applied for this job", 409);
  const ref = await Referral.create(JSON.parse(referral));
  const application = await Application.create({
    candidate: req.user.id,
    job,
    referral: ref._id,
    coverLetter,
    additionalNotes,
    resume: {
      path: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
    statusHistory: [
      {
        status: "Applied",
        remarks: "Application submitted",
        changedBy: req.user.id,
      },
    ],
  });
  const admins = await User.find({ role: "admin", status: "active" });
  await Promise.all(
    admins.map((a) =>
      notify(
        a._id,
        "New referral application",
        `${req.user.name} applied for a job.`,
      ),
    ),
  );
  await notify(
    req.user.id,
    "Application submitted",
    "Your referral application has been submitted successfully.",
  );
  res
    .status(201)
    .json({
      application: await populated(Application.findById(application.id)),
    });
});
export const listApplications = asyncHandler(async (req, res) => {
  const {
    status,
    search,
    department,
    location,
    page = 1,
    limit = 10,
  } = req.query;
  const q = req.user.role === "candidate" ? { candidate: req.user.id } : {};
  if (status) q.status = status;
  if (search) q.$or = [{ applicationId: new RegExp(search, "i") }];
  const query = populated(Application.find(q).sort("-createdAt"));
  const all = await query;
  let rows = all.filter(
    (a) =>
      (!department || a.job?.department === department) &&
      (!location || a.job?.location === location) &&
      (!search ||
        q.$or ||
        [
          a.candidate?.name,
          a.candidate?.email,
          a.job?.title,
          a.referral?.employeeId,
        ].some((v) => v?.match(new RegExp(search, "i")))),
  );
  const total = rows.length;
  rows = rows.slice((page - 1) * limit, page * limit);
  res.json({
    applications: rows,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});
export const getApplication = asyncHandler(async (req, res) => {
  const app = await populated(Application.findById(req.params.id));
  if (!app) throw new AppError("Application not found", 404);
  if (
    req.user.role === "candidate" &&
    String(app.candidate?._id) !== String(req.user.id)
  )
    throw new AppError("Access denied", 403);
  res.json({ application: app });
});
export const updateStatus = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) throw new AppError("Application not found", 404);
  const { status, remarks, internalNotes } = req.body;
  if (!status) throw new AppError("Status is required");
  if (
    ![
      "Applied",
      "Resume Under Review",
      "Interview Scheduled",
      "Technical Round",
      "HR Round",
      "Selected",
      "Rejected",
      "Offer Released",
      "Joined",
      "Withdrawn",
    ].includes(status)
  )
    throw new AppError("Invalid application status");
  app.status = status;
  app.hrRemarks = remarks ?? app.hrRemarks;
  app.internalNotes = internalNotes ?? app.internalNotes;
  app.statusHistory.push({ status, remarks, changedBy: req.user.id });
  await app.save();
  await notify(
    app.candidate,
    "Application status updated",
    `Your application is now: ${status}`,
  );
  await ActivityLog.create({
    actor: req.user.id,
    action: `Updated status to ${status}`,
    entityType: "Application",
    entityId: app._id,
  });
  res.json({ application: await populated(Application.findById(app.id)) });
});
export const withdraw = asyncHandler(async (req, res) => {
  const app = await Application.findOne({
    _id: req.params.id,
    candidate: req.user.id,
  });
  if (!app) throw new AppError("Application not found", 404);
  if (["Joined", "Rejected"].includes(app.status))
    throw new AppError("This application cannot be withdrawn");
  app.status = "Withdrawn";
  app.statusHistory.push({
    status: "Withdrawn",
    remarks: "Withdrawn by candidate",
    changedBy: req.user.id,
  });
  await app.save();
  res.json({ application: app });
});
