import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    department: { type: String, required: true },
    relationship: { type: String, required: true },
    candidateContact: { type: String, required: true, trim: true },
    candidateRelationship: { type: String, required: true },
    durationKnown: { type: String, required: true },
    workedDirectly: { type: String, enum: ["Yes", "No"], required: true },
    candidateExperienceLevel: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    remarks: String,
  },
  { timestamps: true },
);
schema.index({ candidateContact: 1 });
export default mongoose.model("Referral", schema);
