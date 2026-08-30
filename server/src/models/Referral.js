import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    employeeName: { type: String, required: true },
    employeeId: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    department: { type: String, required: true },
    relationship: { type: String, required: true },
    remarks: String,
  },
  { timestamps: true },
);
export default mongoose.model("Referral", schema);
