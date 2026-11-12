import "dotenv/config";
import fs from "fs";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startReminderJob } from "./jobs/reminderJob.js";

// Global handlers for uncaught errors (prevents silent crashes)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

fs.mkdirSync("src/uploads", { recursive: true });
connectDB()
  .then(() => {
    // Start the reminder cron job
    startReminderJob();
    
    app.listen(process.env.PORT || 5000, () =>
      console.log(`API on ${process.env.PORT || 5000}`),
    );
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
