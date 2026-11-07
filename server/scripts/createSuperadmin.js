import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import User from "../src/models/User.js";

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.error(
    'Usage: npm run create-superadmin -- "Name" email@example.com "Password"',
  );
  process.exit(1);
}

// Validate password strength
if (password.length < 8) {
  console.error("Password must be at least 8 characters long");
  process.exit(1);
}

await connectDB();

// Check if any superadmin already exists
const existingSuperadmin = await User.findOne({ role: "superadmin" });
if (existingSuperadmin) {
  console.log(`A superadmin already exists: ${existingSuperadmin.email}`);
  console.log("Only one superadmin account is allowed.");
  console.log("To update, modify the existing account directly in the database.");
  await mongoose.disconnect();
  process.exit(1);
}

// Check if email is already in use
const existingUser = await User.findOne({ email: email.toLowerCase() });
if (existingUser) {
  console.error(`Email ${email} is already registered as ${existingUser.role}`);
  await mongoose.disconnect();
  process.exit(1);
}

// Create the superadmin
const user = await User.create({
  name,
  email,
  password,
  role: "superadmin",
  status: "active",
});

console.log(`Super Admin created successfully: ${user.email}`);
await mongoose.disconnect();