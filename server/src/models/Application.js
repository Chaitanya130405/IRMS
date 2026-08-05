import mongoose from "mongoose";
const historySchema = new mongoose.Schema(
  {
    status: String,
    remarks: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    applicationId: { type: String, unique: true },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
    },
    resume: {
      path: String,
      originalName: String,
      mimetype: String,
      size: Number,
    },
    coverLetter: String,
    additionalNotes: String,
    status: {
      type: String,
      enum: [
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
      ],
      default: "Applied",
    },
    hrRemarks: String,
    internalNotes: String,
    statusHistory: [historySchema],
  },
  { timestamps: true },
);
schema.pre("validate", function (next) {
  if (!this.applicationId)
    this.applicationId = `APP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  next();
});
schema.index({ candidate: 1, job: 1 }, { unique: true });
export default mongoose.model("Application", schema);
