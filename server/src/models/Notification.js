import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);
schema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Notification", schema);
