import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import Job from "../src/models/Job.js";
import Referral from "../src/models/Referral.js";
import Application from "../src/models/Application.js";
import Notification from "../src/models/Notification.js";
import ActivityLog from "../src/models/ActivityLog.js";

await connectDB();

// This is intentionally a reset-style development seed.
await Promise.all([
  ActivityLog.deleteMany({}),
  Notification.deleteMany({}),
  Application.deleteMany({}),
  Referral.deleteMany({}),
  Job.deleteMany({}),
  User.deleteMany({}),
]);

const [superAdmin, primaryHr, recruiter, pendingHr, ...candidates] =
  await User.create([
    {
      name: "Super Administrator",
      email: "superadmin@referral.local",
      password: "SuperAdmin@123",
      role: "superadmin",
      status: "active",
    },
    {
      name: "Aarav Mehta",
      email: "admin@referral.local",
      password: "Admin@123",
      role: "admin",
      phone: "9876500001",
      status: "active",
      lastLogin: new Date(),
    },
    {
      name: "Nisha Kapoor",
      email: "nisha.hr@referral.local",
      password: "Recruiter@123",
      role: "admin",
      phone: "9876500002",
      status: "active",
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      name: "Rohan Iyer",
      email: "rohan.hr@referral.local",
      password: "PendingHR@123",
      role: "admin",
      phone: "9876500003",
      status: "inactive",
    },
    {
      name: "Ananya Sharma",
      email: "candidate@referral.local",
      password: "Candidate@123",
      phone: "9876543210",
    },
    {
      name: "Vikram Rao",
      email: "vikram.rao@referral.local",
      password: "Candidate@123",
      phone: "9876543211",
    },
    {
      name: "Priya Nair",
      email: "priya.nair@referral.local",
      password: "Candidate@123",
      phone: "9876543212",
    },
    {
      name: "Kabir Singh",
      email: "kabir.singh@referral.local",
      password: "Candidate@123",
      phone: "9876543213",
    },
    {
      name: "Meera Joshi",
      email: "meera.joshi@referral.local",
      password: "Candidate@123",
      phone: "9876543214",
    },
    {
      name: "Arjun Patel",
      email: "arjun.patel@referral.local",
      password: "Candidate@123",
      phone: "9876543215",
    },
  ]);

const jobs = await Job.create([
  {
    jobId: "ENG-101",
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    description: "Build reliable recruitment platform services and polished web experiences.",
    experience: { min: 3, max: 7 },
    skills: ["React", "Node.js", "MongoDB", "REST APIs"],
    location: "Bengaluru",
    employmentType: "Full-time",
    status: "active",
    createdBy: primaryHr._id,
  },
  {
    jobId: "DES-202",
    title: "Product Designer",
    department: "Design",
    description: "Shape accessible, user-centred hiring products from research through delivery.",
    experience: { min: 3, max: 6 },
    skills: ["Figma", "User Research", "Design Systems"],
    location: "Mumbai",
    employmentType: "Full-time",
    status: "active",
    createdBy: recruiter._id,
  },
  {
    jobId: "DAT-303",
    title: "Data Analyst",
    department: "Analytics",
    description: "Turn recruiting and business data into trustworthy, actionable insights.",
    experience: { min: 2, max: 5 },
    skills: ["SQL", "Python", "Power BI"],
    location: "Hyderabad",
    employmentType: "Full-time",
    status: "active",
    createdBy: primaryHr._id,
  },
  {
    jobId: "MKT-404",
    title: "Growth Marketing Manager",
    department: "Marketing",
    description: "Lead measurable acquisition and lifecycle campaigns for a growing platform.",
    experience: { min: 4, max: 8 },
    skills: ["SEO", "Campaign Management", "Analytics"],
    location: "Remote",
    employmentType: "Full-time",
    status: "closed",
    createdBy: recruiter._id,
  },
  {
    jobId: "OPS-505",
    title: "People Operations Intern",
    department: "People",
    description: "Support employee experience and recruitment operations across the organisation.",
    experience: { min: 0, max: 1 },
    skills: ["Communication", "Excel", "Organisation"],
    location: "Bengaluru",
    employmentType: "Internship",
    status: "draft",
    createdBy: primaryHr._id,
  },
]);

const referralDetails = [
  ["Sanjay Verma", "EMP-1021", "sanjay.verma@ispace.local", "Engineering", "Former colleague"],
  ["Neha Gupta", "EMP-1064", "neha.gupta@ispace.local", "Design", "Worked together"],
  ["Rahul Das", "EMP-1103", "rahul.das@ispace.local", "Analytics", "Professional network"],
  ["Aditi Kulkarni", "EMP-1117", "aditi.k@ispace.local", "Engineering", "University peer"],
  ["Dev Malhotra", "EMP-1148", "dev.m@ispace.local", "Marketing", "Former manager"],
  ["Ishita Bose", "EMP-1189", "ishita.b@ispace.local", "People", "Former colleague"],
];
const referrals = await Referral.create(
  referralDetails.map(([employeeName, employeeId, employeeEmail, department, relationship]) => ({
    employeeName,
    employeeId,
    employeeEmail,
    department,
    relationship,
    remarks: "Strong recommendation based on direct collaboration.",
  })),
);

const applicationSeed = [
  [candidates[0], jobs[0], referrals[0], "Applied", primaryHr],
  [candidates[1], jobs[1], referrals[1], "Resume Under Review", recruiter],
  [candidates[2], jobs[2], referrals[2], "Interview Scheduled", primaryHr],
  [candidates[3], jobs[0], referrals[3], "Technical Round", recruiter],
  [candidates[4], jobs[3], referrals[4], "Rejected", primaryHr],
  [candidates[5], jobs[4], referrals[5], "Selected", recruiter],
];

const applications = await Promise.all(
  applicationSeed.map(async ([candidate, job, referral, status, changedBy], index) => {
    const history = [
      { status: "Applied", remarks: "Application submitted", changedBy: candidate._id },
    ];
    if (status !== "Applied")
      history.push({ status, remarks: "Updated by HR team", changedBy: changedBy._id });
    return Application.create({
      applicationId: `APP-DEMO-${String(index + 1).padStart(3, "0")}`,
      candidate: candidate._id,
      job: job._id,
      referral: referral._id,
      coverLetter: "I am excited to contribute my experience to this opportunity.",
      additionalNotes: "Demo application generated by the seed script.",
      status,
      statusHistory: history,
    });
  }),
);

await Notification.create([
  ...applications.map((application, index) => ({
    user: application.candidate,
    title: "Application submitted",
    message: `Your application ${application.applicationId} has been submitted successfully.`,
    read: index > 1,
  })),
  {
    user: candidates[2]._id,
    title: "Interview scheduled",
    message: "Your interview has been scheduled. Check your application for the next steps.",
  },
  {
    user: primaryHr._id,
    title: "New referral application",
    message: "A new referral application is ready for review.",
  },
  {
    user: recruiter._id,
    title: "Application status updated",
    message: "A candidate has moved to the technical round.",
  },
]);

await ActivityLog.create([
  { actor: primaryHr._id, action: "Created Senior Full Stack Engineer", entityType: "Job", entityId: jobs[0]._id },
  { actor: recruiter._id, action: "Updated status to Resume Under Review", entityType: "Application", entityId: applications[1]._id },
  { actor: primaryHr._id, action: "Updated status to Interview Scheduled", entityType: "Application", entityId: applications[2]._id },
  { actor: recruiter._id, action: "Updated status to Technical Round", entityType: "Application", entityId: applications[3]._id },
  { actor: primaryHr._id, action: "Updated status to Rejected", entityType: "Application", entityId: applications[4]._id },
  { actor: recruiter._id, action: "Updated status to Selected", entityType: "Application", entityId: applications[5]._id },
]);

console.log("Seeded 1 Super Admin, 3 HR admins, 6 candidates, 5 jobs, and 6 applications.");
console.log("Super Admin: superadmin@referral.local / SuperAdmin@123");
console.log("HR Admin: admin@referral.local / Admin@123");
console.log("Candidate: candidate@referral.local / Candidate@123");
await mongoose.disconnect();
