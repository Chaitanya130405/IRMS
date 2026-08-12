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

await connectDB();
let user = await User.findOne({ email: email.toLowerCase() }).select("+password");
if (user) {
  user.name = name;
  user.role = "superadmin";
  user.status = "active";
  user.password = password;
  await user.save();
} else {
  user = await User.create({
    name,
    email,
    password,
    role: "superadmin",
    status: "active",
  });
}

console.log(`Super Admin ready: ${user.email}`);
await mongoose.disconnect();
