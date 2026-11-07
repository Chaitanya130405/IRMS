import Job from "../models/Job.js";
import { escapeRegex } from "../utils/helpers.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const listJobs = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 50, 1), 100);

  const q = {};
  if (status) q.status = status;
  if (search)
    q.$or = [
      { title: new RegExp(escapeRegex(search), "i") },
      { jobId: new RegExp(escapeRegex(search), "i") },
      { department: new RegExp(escapeRegex(search), "i") },
    ];

  const [total, jobs] = await Promise.all([
    Job.countDocuments(q),
    Job.find(q)
      .select(req.user.role === "candidate" ? "-clientName -projectName" : "")
      .sort("-createdAt")
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
  ]);

  res.json({ jobs, total, page: pageNumber, pages: Math.ceil(total / pageSize) });
});
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).select(
    req.user.role === "candidate" ? "-clientName -projectName" : "",
  );
  if (!job) throw new AppError("Job not found", 404);
  res.json({ job });
});
export const createJob = asyncHandler(async (req, res) => {
  // Allowlist of fields that can be set (prevents mass assignment)
  const allowedFields = [
    "jobId",
    "title",
    "clientName",
    "projectName",
    "department",
    "description",
    "experienceLevel",
    "openings",
    "priority",
    "workMode",
    "experience",
    "skills",
    "employmentType",
    "salaryRange",
    "location",
    "status",
    "closingDate",
  ];

  const jobData = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const job = await Job.create({ ...jobData, createdBy: req.user.id });
  res.status(201).json({ job });
});
export const updateJob = asyncHandler(async (req, res) => {
  // Allowlist of fields that can be updated (prevents mass assignment)
  const allowedFields = [
    "jobId",
    "title",
    "clientName",
    "projectName",
    "department",
    "description",
    "experienceLevel",
    "openings",
    "priority",
    "workMode",
    "experience",
    "skills",
    "employmentType",
    "salaryRange",
    "location",
    "status",
    "closingDate",
  ];

  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const job = await Job.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!job) throw new AppError("Job not found", 404);
  res.json({ job });
});
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) throw new AppError("Job not found", 404);
  res.status(204).end();
});
