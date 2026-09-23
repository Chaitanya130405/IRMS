import mongoose from "mongoose";
const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    clientName: { type: String, trim: true },
    projectName: { type: String, trim: true },
    department: { type: String, required: true },
    description: { type: String, default: "" },
    experienceLevel: { type: String, trim: true },
    openings: { type: Number, min: 1, default: 1 },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    workMode: {
      type: String,
      enum: ["Onsite", "WFO", "WFH"],
      default: "Onsite",
    },
    experience: { min: { type: Number, default: 0 }, max: Number },
    skills: [String],
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time",
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: "INR" },
    },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },
    closingDate: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
jobSchema.index({ status: 1, createdAt: -1 });
export default mongoose.model("Job", jobSchema);
