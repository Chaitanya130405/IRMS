import PreOnboarding from "../models/PreOnboarding.js";
import Application from "../models/Application.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { notify } from "../services/notificationService.js";
import { sendJoiningDateNotification } from "../services/emailService.js";

// Helper to populate pre-onboarding data
const populatePreOnboarding = (query) =>
  query
    .populate("candidate", "name email phone profilePicture")
    .populate("job", "title jobId department clientName projectName location")
    .populate("application", "applicationId status")
    .populate("assignedTo", "name email");

// Create pre-onboarding for a selected candidate
export const createPreOnboarding = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { 
    clientName, 
    isCriticalHire, 
    expectedJoiningDate, 
    engagementStartDate, 
    assignedTo,
    reportingManagerEmail,
    reportingManagerName,
  } = req.body;

  // Check if application exists and is in Selected/Offer Released status
  const application = await Application.findById(applicationId).populate("candidate job");
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  if (!["Selected", "Offer Released"].includes(application.status)) {
    throw new AppError("Pre-onboarding can only be created for Selected or Offer Released candidates", 400);
  }

  // Check if pre-onboarding already exists
  const existing = await PreOnboarding.findOne({ application: applicationId });
  if (existing) {
    throw new AppError("Pre-onboarding already exists for this application", 409);
  }

  // Get default activities
  const defaultActivities = PreOnboarding.getDefaultActivities();

  // Create pre-onboarding
  const preOnboarding = await PreOnboarding.create({
    application: applicationId,
    candidate: application.candidate._id,
    job: application.job._id,
    clientName: clientName || application.job.clientName || "",
    isCriticalHire: isCriticalHire ?? true,
    expectedJoiningDate,
    engagementStartDate: engagementStartDate || new Date(),
    assignedTo: assignedTo || req.user.id,
    overallStatus: "In Progress",
    activities: defaultActivities,
    reportingManagerEmail,
    reportingManagerName,
    history: [
      {
        action: "Pre-onboarding checklist created",
        changedBy: req.user.id,
      },
    ],
  });

  // Notify the candidate
  await notify(
    application.candidate._id,
    "Pre-onboarding started",
    "Your pre-onboarding process has begun. We're excited to have you join us!"
  );

  // Send email to reporting manager if joining date is set
  if (expectedJoiningDate && reportingManagerEmail) {
    await sendJoiningDateNotification({
      reportingManagerEmail,
      reportingManagerName,
      candidateName: application.candidate.name,
      jobTitle: application.job.title,
      joiningDate: expectedJoiningDate,
      isUpdate: false,
    });
  }

  const populated = await populatePreOnboarding(PreOnboarding.findById(preOnboarding._id));
  res.status(201).json({ preOnboarding: populated });
});

// Get all pre-onboardings (admin)
export const listPreOnboardings = asyncHandler(async (req, res) => {
  const { status, search, assignedTo, page = 1, limit = 10 } = req.query;
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const query = {};

  if (status) {
    query.overallStatus = status;
  }

  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  // Build aggregation for search
  let preOnboardings;
  let total;

  if (search) {
    // Search in candidate name/email or job title
    const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "candidate",
          foreignField: "_id",
          as: "candidateData",
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "jobData",
        },
      },
      {
        $match: {
          ...query,
          $or: [
            { "candidateData.name": searchRegex },
            { "candidateData.email": searchRegex },
            { "jobData.title": searchRegex },
            { clientName: searchRegex },
          ],
        },
      },
    ];

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await PreOnboarding.aggregate(countPipeline);
    total = countResult[0]?.total || 0;

    const ids = await PreOnboarding.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      { $project: { _id: 1 } },
    ]);

    preOnboardings = await populatePreOnboarding(
      PreOnboarding.find({ _id: { $in: ids.map((d) => d._id) } }).sort("-createdAt")
    );
  } else {
    [total, preOnboardings] = await Promise.all([
      PreOnboarding.countDocuments(query),
      populatePreOnboarding(
        PreOnboarding.find(query)
          .sort("-createdAt")
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
      ),
    ]);
  }

  // Add stats to each pre-onboarding
  const enrichedData = preOnboardings.map((po) => ({
    ...po.toObject(),
    stats: po.getStats(),
  }));

  res.json({
    preOnboardings: enrichedData,
    total,
    page: pageNumber,
    pages: Math.ceil(total / pageSize),
  });
});

// Get single pre-onboarding details
export const getPreOnboarding = asyncHandler(async (req, res) => {
  const preOnboarding = await populatePreOnboarding(PreOnboarding.findById(req.params.id));

  if (!preOnboarding) {
    throw new AppError("Pre-onboarding not found", 404);
  }

  res.json({
    preOnboarding: {
      ...preOnboarding.toObject(),
      stats: preOnboarding.getStats(),
    },
  });
});

// Get pre-onboarding by application ID
export const getPreOnboardingByApplication = asyncHandler(async (req, res) => {
  const preOnboarding = await populatePreOnboarding(
    PreOnboarding.findOne({ application: req.params.applicationId })
  );

  if (!preOnboarding) {
    return res.json({ preOnboarding: null });
  }

  res.json({
    preOnboarding: {
      ...preOnboarding.toObject(),
      stats: preOnboarding.getStats(),
    },
  });
});

// Update pre-onboarding details
export const updatePreOnboarding = asyncHandler(async (req, res) => {
  const { 
    clientName, 
    isCriticalHire, 
    expectedJoiningDate, 
    engagementStartDate, 
    assignedTo, 
    overallStatus, 
    remarks,
    reportingManagerEmail,
    reportingManagerName,
  } = req.body;

  const preOnboarding = await PreOnboarding.findById(req.params.id).populate("candidate job");
  if (!preOnboarding) {
    throw new AppError("Pre-onboarding not found", 404);
  }

  // Track changes for history
  const changes = [];
  let joiningDateChanged = false;
  const previousJoiningDate = preOnboarding.expectedJoiningDate;

  if (clientName !== undefined && clientName !== preOnboarding.clientName) {
    changes.push(`Client name updated to "${clientName}"`);
    preOnboarding.clientName = clientName;
  }

  if (isCriticalHire !== undefined && isCriticalHire !== preOnboarding.isCriticalHire) {
    changes.push(`Critical hire set to ${isCriticalHire ? "Yes" : "No"}`);
    preOnboarding.isCriticalHire = isCriticalHire;
  }

  if (expectedJoiningDate !== undefined) {
    const newDate = new Date(expectedJoiningDate).toISOString().split("T")[0];
    const oldDate = previousJoiningDate ? new Date(previousJoiningDate).toISOString().split("T")[0] : null;
    
    if (newDate !== oldDate) {
      joiningDateChanged = true;
      changes.push(`Expected joining date updated`);
      preOnboarding.expectedJoiningDate = expectedJoiningDate;
      // Reset reminder flag when date changes
      preOnboarding.reminderSent = false;
    }
  }

  if (engagementStartDate !== undefined) {
    changes.push(`Engagement start date updated`);
    preOnboarding.engagementStartDate = engagementStartDate;
  }

  if (assignedTo !== undefined && String(assignedTo) !== String(preOnboarding.assignedTo)) {
    changes.push(`Assignment changed`);
    preOnboarding.assignedTo = assignedTo;
  }

  if (overallStatus !== undefined && overallStatus !== preOnboarding.overallStatus) {
    changes.push(`Overall status changed from "${preOnboarding.overallStatus}" to "${overallStatus}"`);
    preOnboarding.overallStatus = overallStatus;

    if (overallStatus === "Dropped") {
      preOnboarding.droppedAt = new Date();
      preOnboarding.droppedReason = remarks || "No reason provided";
    }
  }

  if (remarks !== undefined) {
    preOnboarding.remarks = remarks;
  }

  // Update reporting manager info
  if (reportingManagerEmail !== undefined) {
    preOnboarding.reportingManagerEmail = reportingManagerEmail;
  }
  if (reportingManagerName !== undefined) {
    preOnboarding.reportingManagerName = reportingManagerName;
  }

  // Add history entry
  if (changes.length > 0) {
    preOnboarding.history.push({
      action: changes.join("; "),
      changedBy: req.user.id,
    });
  }

  await preOnboarding.save();

  // Send email to reporting manager if joining date changed
  const managerEmail = reportingManagerEmail || preOnboarding.reportingManagerEmail;
  if (joiningDateChanged && managerEmail) {
    await sendJoiningDateNotification({
      reportingManagerEmail: managerEmail,
      reportingManagerName: reportingManagerName || preOnboarding.reportingManagerName,
      candidateName: preOnboarding.candidate?.name || "Candidate",
      jobTitle: preOnboarding.job?.title || "N/A",
      joiningDate: expectedJoiningDate,
      isUpdate: !!previousJoiningDate,
    });
  }

  const populated = await populatePreOnboarding(PreOnboarding.findById(preOnboarding._id));
  res.json({
    preOnboarding: {
      ...populated.toObject(),
      stats: populated.getStats(),
    },
  });
});

// Update activity status
export const updateActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  const { status, followUpDate, notes } = req.body;

  const preOnboarding = await PreOnboarding.findById(req.params.id);
  if (!preOnboarding) {
    throw new AppError("Pre-onboarding not found", 404);
  }

  const activity = preOnboarding.activities.id(activityId);
  if (!activity) {
    throw new AppError("Activity not found", 404);
  }

  const previousStatus = activity.status;

  // Update activity
  if (status !== undefined) {
    activity.status = status;
    if (status === "Completed") {
      activity.completedAt = new Date();
      activity.completedBy = req.user.id;
    }
  }

  if (followUpDate !== undefined) {
    activity.followUpDate = followUpDate;
  }

  if (notes !== undefined) {
    activity.notes = notes;
  }

  // Add history entry
  preOnboarding.history.push({
    action: `Activity updated`,
    activityTitle: activity.title,
    previousStatus,
    newStatus: status || previousStatus,
    notes: notes || "",
    changedBy: req.user.id,
  });

  // Update overall status based on activities
  const stats = preOnboarding.getStats();
  if (stats.atRisk > 0) {
    preOnboarding.overallStatus = "At Risk";
  } else if (stats.completed === stats.total) {
    preOnboarding.overallStatus = "Completed";
  } else if (stats.completed > 0 || stats.inProgress > 0) {
    preOnboarding.overallStatus = stats.pending > 3 ? "In Progress" : "On Track";
  }

  await preOnboarding.save();

  const populated = await populatePreOnboarding(PreOnboarding.findById(preOnboarding._id));
  res.json({
    preOnboarding: {
      ...populated.toObject(),
      stats: populated.getStats(),
    },
  });
});

// Add custom activity
export const addActivity = asyncHandler(async (req, res) => {
  const { title, owner, isCriticalHire } = req.body;

  if (!title) {
    throw new AppError("Activity title is required", 400);
  }

  const preOnboarding = await PreOnboarding.findById(req.params.id);
  if (!preOnboarding) {
    throw new AppError("Pre-onboarding not found", 404);
  }

  const newActivityNumber = preOnboarding.activities.length + 1;

  preOnboarding.activities.push({
    activityNumber: newActivityNumber,
    title,
    owner: owner || "Hiring Team",
    isCriticalHire: isCriticalHire ?? true,
    status: "Not Started",
  });

  preOnboarding.history.push({
    action: `Custom activity added: "${title}"`,
    changedBy: req.user.id,
  });

  await preOnboarding.save();

  const populated = await populatePreOnboarding(PreOnboarding.findById(preOnboarding._id));
  res.json({
    preOnboarding: {
      ...populated.toObject(),
      stats: populated.getStats(),
    },
  });
});

// Get dashboard stats for pre-onboarding
export const getPreOnboardingDashboard = asyncHandler(async (req, res) => {
  const [total, inProgress, onTrack, atRisk, completed, dropped] = await Promise.all([
    PreOnboarding.countDocuments(),
    PreOnboarding.countDocuments({ overallStatus: "In Progress" }),
    PreOnboarding.countDocuments({ overallStatus: "On Track" }),
    PreOnboarding.countDocuments({ overallStatus: "At Risk" }),
    PreOnboarding.countDocuments({ overallStatus: "Completed" }),
    PreOnboarding.countDocuments({ overallStatus: "Dropped" }),
  ]);

  // Get upcoming follow-ups (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingFollowUps = await PreOnboarding.aggregate([
    { $unwind: "$activities" },
    {
      $match: {
        "activities.followUpDate": {
          $gte: new Date(),
          $lte: nextWeek,
        },
        "activities.status": { $ne: "Completed" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "candidate",
        foreignField: "_id",
        as: "candidateData",
      },
    },
    {
      $project: {
        preOnboardingId: "$_id",
        activityTitle: "$activities.title",
        followUpDate: "$activities.followUpDate",
        status: "$activities.status",
        candidateName: { $arrayElemAt: ["$candidateData.name", 0] },
      },
    },
    { $sort: { followUpDate: 1 } },
    { $limit: 10 },
  ]);

  // Get at-risk candidates
  const atRiskCandidates = await populatePreOnboarding(
    PreOnboarding.find({ overallStatus: "At Risk" }).sort("-updatedAt").limit(5)
  );

  res.json({
    stats: {
      total,
      inProgress,
      onTrack,
      atRisk,
      completed,
      dropped,
    },
    upcomingFollowUps,
    atRiskCandidates: atRiskCandidates.map((po) => ({
      ...po.toObject(),
      stats: po.getStats(),
    })),
  });
});

// Export pre-onboarding data
export const exportPreOnboardings = asyncHandler(async (req, res) => {
  const preOnboardings = await populatePreOnboarding(PreOnboarding.find().sort("-createdAt"));

  const data = preOnboardings.map((po) => {
    const stats = po.getStats();
    return {
      candidateName: po.candidate?.name || "N/A",
      candidateEmail: po.candidate?.email || "N/A",
      jobTitle: po.job?.title || "N/A",
      clientName: po.clientName || "N/A",
      isCriticalHire: po.isCriticalHire ? "Yes" : "No",
      expectedJoiningDate: po.expectedJoiningDate?.toISOString().split("T")[0] || "N/A",
      engagementStartDate: po.engagementStartDate?.toISOString().split("T")[0] || "N/A",
      overallStatus: po.overallStatus,
      progress: `${stats.completed}/${stats.total} (${stats.progressPercent}%)`,
      atRiskActivities: stats.atRisk,
      assignedTo: po.assignedTo?.name || "N/A",
      reportingManagerEmail: po.reportingManagerEmail || "N/A",
      createdAt: po.createdAt.toISOString().split("T")[0],
    };
  });

  res.json({ data });
});
