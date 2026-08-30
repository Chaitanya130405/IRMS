import Job from "../models/Job.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
export const listJobs = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const q = {};
  if (status) q.status = status;
  if (search)
    q.$or = [
      { title: new RegExp(search, "i") },
      { jobId: new RegExp(search, "i") },
      { department: new RegExp(search, "i") },
    ];
  const jobs = await Job.find(q)
    .select(req.user.role === "candidate" ? "-clientName -projectName" : "")
    .sort("-createdAt");
  res.json({ jobs });
});
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).select(
    req.user.role === "candidate" ? "-clientName -projectName" : "",
  );
  if (!job) throw new AppError("Job not found", 404);
  res.json({ job });
});
export const createJob = asyncHandler(async (req, res) =>
  res
    .status(201)
    .json({ job: await Job.create({ ...req.body, createdBy: req.user.id }) }),
);
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
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
