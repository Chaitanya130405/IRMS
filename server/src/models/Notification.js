import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    title: String,
    message: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);
schema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Notification", schema);
