import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

// Indexes for common queries
schema.index({ actor: 1, createdAt: -1 }); // User activity lookups
schema.index({ entityType: 1, entityId: 1, createdAt: -1 }); // Entity history lookups

export default mongoose.model("ActivityLog", schema);
