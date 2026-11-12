import mongoose from "mongoose";

// Individual checklist activity schema
const activitySchema = new mongoose.Schema(
  {
    activityNumber: { type: Number, required: true },
    title: { type: String, required: true },
    owner: {
      type: String,
      enum: ["Hiring Team", "Hiring Manager", "Admin Team", "Management", "TSA / TSM"],
      default: "Hiring Team",
    },
    isCriticalHire: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["Not Started", "Pending", "In Progress", "Completed", "At Risk"],
      default: "Not Started",
    },
    followUpDate: Date,
    notes: { type: String, default: "" },
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

// History entry for tracking changes
const historySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    activityTitle: String,
    previousStatus: String,
    newStatus: String,
    notes: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Main pre-onboarding schema
const preOnboardingSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    // Pre-onboarding specific fields
    clientName: { type: String, default: "" },
    isCriticalHire: { type: Boolean, default: false },
    expectedJoiningDate: Date,
    engagementStartDate: { type: Date, default: Date.now },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    overallStatus: {
      type: String,
      enum: ["Not Started", "In Progress", "On Track", "At Risk", "Completed", "Dropped"],
      default: "Not Started",
    },
    // Checklist activities
    activities: [activitySchema],
    // History tracking
    history: [historySchema],
    // Notes and remarks
    remarks: String,
    droppedReason: String,
    droppedAt: Date,
    // Reporting Manager for notifications
    reportingManagerEmail: String,
    reportingManagerName: String,
    // Reminder tracking
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: Date,
  },
  { timestamps: true }
);

// Default activities template
preOnboardingSchema.statics.getDefaultActivities = function () {
  return [
    {
      activityNumber: 1,
      title: "Welcome email with offer details, CTC breakup and onboarding steps",
      owner: "Hiring Team",
      isCriticalHire: true,
    },
    {
      activityNumber: 2,
      title: "Signed offer acceptance collected",
      owner: "Hiring Team",
      isCriticalHire: true,
    },
    {
      activityNumber: 3,
      title: "Discuss joining timeline, resignation process and last working date",
      owner: "Hiring Team",
      isCriticalHire: true,
    },
    {
      activityNumber: 4,
      title: "Collect resignation proof, employer acknowledgement",
      owner: "Hiring Team",
      isCriticalHire: true,
    },
    {
      activityNumber: 5,
      title: "Regular touch-base calls with candidate",
      owner: "Hiring Team",
      isCriticalHire: true,
    },
    {
      activityNumber: 6,
      title: "Coffee chat / video connect with TSA / TSM",
      owner: "TSA / TSM",
      isCriticalHire: true,
    },
    {
      activityNumber: 7,
      title: "Invitation to office events, celebrations and engagement activities",
      owner: "Hiring Team",
      isCriticalHire: true,
    },
    {
      activityNumber: 8,
      title: "Sharing company updates, project achievements and growth opportunities",
      owner: "Hiring Team",
      isCriticalHire: false,
    },
    {
      activityNumber: 9,
      title: "Joining risk assessment and drop-out prevention discussions",
      owner: "Hiring Team",
      isCriticalHire: true,
    },
    {
      activityNumber: 10,
      title: "Manager / Leadership connect before joining",
      owner: "Hiring Manager",
      isCriticalHire: false,
    },
    {
      activityNumber: 11,
      title: "Welcome gift / joining kit before onboarding",
      owner: "Admin Team",
      isCriticalHire: true,
    },
    {
      activityNumber: 12,
      title: "Relocation and accommodation assistance",
      owner: "Admin Team",
      isCriticalHire: true,
    },
  ];
};

// Calculate progress stats
preOnboardingSchema.methods.getStats = function () {
  const total = this.activities.length;
  const completed = this.activities.filter((a) => a.status === "Completed").length;
  const pending = this.activities.filter((a) => a.status === "Pending").length;
  const inProgress = this.activities.filter((a) => a.status === "In Progress").length;
  const atRisk = this.activities.filter((a) => a.status === "At Risk").length;
  const notStarted = this.activities.filter((a) => a.status === "Not Started").length;

  return {
    total,
    completed,
    pending,
    inProgress,
    atRisk,
    notStarted,
    progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

// Indexes (application unique index is already defined in schema)
preOnboardingSchema.index({ candidate: 1 });
preOnboardingSchema.index({ overallStatus: 1, createdAt: -1 });
preOnboardingSchema.index({ assignedTo: 1, overallStatus: 1 });
preOnboardingSchema.index({ expectedJoiningDate: 1 });

export default mongoose.model("PreOnboarding", preOnboardingSchema);
