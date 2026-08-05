import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import Job from "../src/models/Job.js";
await connectDB();
await Promise.all([User.deleteMany({}), Job.deleteMany({})]);
const admin = await User.create({
  name: "HR Administrator",
  email: "admin@referral.local",
  password: "Admin@123",
  role: "admin",
});
await User.create({
  name: "Demo Candidate",
  email: "candidate@referral.local",
  password: "Candidate@123",
  phone: "9876543210",
});
await Job.create({
  jobId: "ENG-101",
  title: "Senior Full Stack Engineer",
  department: "Engineering",
  description: "Build reliable recruitment platform services.",
  experience: { min: 3, max: 7 },
  skills: ["React", "Node.js", "MongoDB"],
  location: "Bengaluru",
  createdBy: admin._id,
});
console.log("Seeded: admin@referral.local / Admin@123");
await mongoose.disconnect();
