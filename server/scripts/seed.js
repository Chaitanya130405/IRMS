import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";
import Job from "../src/models/Job.js";
import Referral from "../src/models/Referral.js";
import Application from "../src/models/Application.js";
import Notification from "../src/models/Notification.js";
import ActivityLog from "../src/models/ActivityLog.js";
import PreOnboarding from "../src/models/PreOnboarding.js";

// Warn about destructive operation
if (process.argv.includes("--force") === false) {
  console.log("\n??  WARNING: This will DELETE ALL existing data!");
  console.log("   Run with --force flag to proceed: npm run seed -- --force\n");
  process.exit(0);
}

await connectDB();
console.log("Resetting database...");

await Promise.all([
  PreOnboarding.deleteMany({}),
  ActivityLog.deleteMany({}),
  Notification.deleteMany({}),
  Application.deleteMany({}),
  Referral.deleteMany({}),
  Job.deleteMany({}),
  User.deleteMany({}),
]);

const [superAdmin, primaryHr, recruiter, pendingHr, ...candidates] =
  await User.create([
    { name: "Super Administrator", email: "superadmin@referral.local", password: "SuperAdmin@123", role: "superadmin", status: "active" },
    { name: "Aarav Mehta", email: "admin@referral.local", password: "Admin@123", role: "admin", phone: "9876500001", status: "active", lastLogin: new Date() },
    { name: "Nisha Kapoor", email: "nisha.hr@referral.local", password: "Recruiter@123", role: "admin", phone: "9876500002", status: "active", lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 5) },
    { name: "Rohan Iyer", email: "rohan.hr@referral.local", password: "PendingHR@123", role: "admin", phone: "9876500003", status: "inactive" },
    { name: "Ananya Sharma", email: "candidate@referral.local", password: "Candidate@123", phone: "9876543210" },
    { name: "Vikram Rao", email: "vikram.rao@referral.local", password: "Candidate@123", phone: "9876543211" },
    { name: "Priya Nair", email: "priya.nair@referral.local", password: "Candidate@123", phone: "9876543212" },
    { name: "Kabir Singh", email: "kabir.singh@referral.local", password: "Candidate@123", phone: "9876543213" },
    { name: "Meera Joshi", email: "meera.joshi@referral.local", password: "Candidate@123", phone: "9876543214" },
    { name: "Arjun Patel", email: "arjun.patel@referral.local", password: "Candidate@123", phone: "9876543215" },
  ]);

const jobs = await Job.create([
  { jobId: "ENG-101", title: "Senior Full Stack Engineer", department: "Engineering", description: "Build reliable recruitment platform services.", experience: { min: 3, max: 7 }, skills: ["React", "Node.js", "MongoDB"], location: "Bengaluru", employmentType: "Full-time", status: "active", createdBy: primaryHr._id },
  { jobId: "DES-202", title: "Product Designer", department: "Design", description: "Shape accessible, user-centred hiring products.", experience: { min: 3, max: 6 }, skills: ["Figma", "User Research"], location: "Mumbai", employmentType: "Full-time", status: "active", createdBy: recruiter._id },
  { jobId: "DAT-303", title: "Data Analyst", department: "Analytics", description: "Turn recruiting data into insights.", experience: { min: 2, max: 5 }, skills: ["SQL", "Python", "Power BI"], location: "Hyderabad", employmentType: "Full-time", status: "active", createdBy: primaryHr._id },
  { jobId: "MKT-404", title: "Growth Marketing Manager", department: "Marketing", description: "Lead acquisition campaigns.", experience: { min: 4, max: 8 }, skills: ["SEO", "Analytics"], location: "Remote", employmentType: "Full-time", status: "closed", createdBy: recruiter._id },
  { jobId: "OPS-505", title: "People Operations Intern", department: "People", description: "Support recruitment operations.", experience: { min: 0, max: 1 }, skills: ["Communication", "Excel"], location: "Bengaluru", employmentType: "Internship", status: "draft", createdBy: primaryHr._id },
]);

const referrals = await Referral.create([
  { employeeName: "Sanjay Verma", employeeId: "EMP-1021", employeeEmail: "sanjay.verma@ispace.local", department: "Engineering", relationship: "Former colleague", candidateContact: "9876543210", candidateRelationship: "Former colleague", durationKnown: "3 years", workedDirectly: "Yes", candidateExperienceLevel: "Senior", designation: "Senior Engineer", remarks: "Strong recommendation" },
  { employeeName: "Neha Gupta", employeeId: "EMP-1064", employeeEmail: "neha.gupta@ispace.local", department: "Design", relationship: "Worked together", candidateContact: "9876543211", candidateRelationship: "Project teammate", durationKnown: "2 years", workedDirectly: "Yes", candidateExperienceLevel: "Mid-level", designation: "Product Designer", remarks: "Strong recommendation" },
  { employeeName: "Rahul Das", employeeId: "EMP-1103", employeeEmail: "rahul.das@ispace.local", department: "Analytics", relationship: "Professional network", candidateContact: "9876543212", candidateRelationship: "Conference contact", durationKnown: "1 year", workedDirectly: "No", candidateExperienceLevel: "Mid-level", designation: "Data Analyst", remarks: "Strong recommendation" },
  { employeeName: "Aditi Kulkarni", employeeId: "EMP-1117", employeeEmail: "aditi.k@ispace.local", department: "Engineering", relationship: "University peer", candidateContact: "9876543213", candidateRelationship: "College batchmate", durationKnown: "5 years", workedDirectly: "No", candidateExperienceLevel: "Senior", designation: "Backend Developer", remarks: "Strong recommendation" },
  { employeeName: "Dev Malhotra", employeeId: "EMP-1148", employeeEmail: "dev.m@ispace.local", department: "Marketing", relationship: "Former manager", candidateContact: "9876543214", candidateRelationship: "Direct report", durationKnown: "4 years", workedDirectly: "Yes", candidateExperienceLevel: "Senior", designation: "Marketing Manager", remarks: "Strong recommendation" },
  { employeeName: "Ishita Bose", employeeId: "EMP-1189", employeeEmail: "ishita.b@ispace.local", department: "People", relationship: "Former colleague", candidateContact: "9876543215", candidateRelationship: "HR team member", durationKnown: "2 years", workedDirectly: "Yes", candidateExperienceLevel: "Entry-level", designation: "HR Intern", remarks: "Strong recommendation" },
]);

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
    const history = [{ status: "Applied", remarks: "Application submitted", changedBy: candidate._id }];
    if (status !== "Applied") history.push({ status, remarks: "Updated by HR team", changedBy: changedBy._id });
    return Application.create({
      applicationId: `APP-DEMO-${String(index + 1).padStart(3, "0")}`,
      candidate: candidate._id, job: job._id, referral: referral._id,
      coverLetter: "I am excited to contribute my experience.", additionalNotes: "Demo application.", status, statusHistory: history,
    });
  }),
);

await Notification.create([
  ...applications.map((app, i) => ({ user: app.candidate, title: "Application submitted", message: `Your application ${app.applicationId} submitted.`, read: i > 1 })),
  { user: candidates[2]._id, title: "Interview scheduled", message: "Your interview has been scheduled." },
  { user: primaryHr._id, title: "New referral application", message: "A new referral application is ready." },
]);

await ActivityLog.create([
  { actor: primaryHr._id, action: "Created Senior Full Stack Engineer", entityType: "Job", entityId: jobs[0]._id },
  { actor: recruiter._id, action: "Updated status to Resume Under Review", entityType: "Application", entityId: applications[1]._id },
  { actor: recruiter._id, action: "Updated status to Selected", entityType: "Application", entityId: applications[5]._id },
]);

const defaultActivities = PreOnboarding.getDefaultActivities();

const preOnboardingRecords = await PreOnboarding.create([
  {
    application: applications[5]._id, candidate: candidates[5]._id, job: jobs[4]._id,
    clientName: "iSpace Technologies", isCriticalHire: true,
    expectedJoiningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    engagementStartDate: new Date(), assignedTo: recruiter._id, overallStatus: "In Progress",
    activities: defaultActivities.map((a, i) => ({ ...a, status: i < 3 ? "Completed" : i < 5 ? "In Progress" : "Not Started", completedAt: i < 3 ? new Date() : undefined, completedBy: i < 3 ? recruiter._id : undefined })),
    history: [{ action: "Pre-onboarding started", changedBy: recruiter._id, createdAt: new Date() }],
    remarks: "Critical hire - fast track onboarding",
  },
  {
    application: applications[2]._id, candidate: candidates[2]._id, job: jobs[2]._id,
    clientName: "DataCorp Analytics", isCriticalHire: false,
    expectedJoiningDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    engagementStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), assignedTo: primaryHr._id, overallStatus: "On Track",
    activities: defaultActivities.map((a, i) => ({ ...a, status: i < 5 ? "Completed" : i < 8 ? "In Progress" : "Not Started", completedAt: i < 5 ? new Date() : undefined, completedBy: i < 5 ? primaryHr._id : undefined })),
    history: [{ action: "Pre-onboarding started", changedBy: primaryHr._id, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }],
    remarks: "Candidate is enthusiastic",
  },
  {
    application: applications[3]._id, candidate: candidates[3]._id, job: jobs[0]._id,
    clientName: "TechStart Solutions", isCriticalHire: true,
    expectedJoiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    engagementStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), assignedTo: recruiter._id, overallStatus: "At Risk",
    activities: defaultActivities.map((a, i) => ({ ...a, status: i < 2 ? "Completed" : i === 2 ? "At Risk" : "Not Started", completedAt: i < 2 ? new Date() : undefined, completedBy: i < 2 ? recruiter._id : undefined, notes: i === 2 ? "Counter-offer from current employer" : "" })),
    history: [{ action: "Pre-onboarding started", changedBy: recruiter._id, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }, { action: "Status changed to At Risk", notes: "Counter-offer detected", changedBy: recruiter._id, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }],
    remarks: "URGENT: Counter-offer situation",
  },
]);

console.log("Seeded: 1 Super Admin, 3 HR admins, 6 candidates, 5 jobs, 6 applications.");
console.log(`Created ${preOnboardingRecords.length} pre-onboarding records.`);
console.log("Super Admin: superadmin@referral.local / SuperAdmin@123");
console.log("HR Admin: admin@referral.local / Admin@123");
console.log("Candidate: candidate@referral.local / Candidate@123");
await mongoose.disconnect();