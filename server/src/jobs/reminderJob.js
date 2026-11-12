import cron from "node-cron";
import PreOnboarding from "../models/PreOnboarding.js";
import { sendJoiningReminderToTeams } from "../services/emailService.js";

/**
 * Check for candidates joining in 2 days and send reminders
 * Runs daily at 9:00 AM
 */
const checkAndSendReminders = async () => {
  console.log("[Reminder Job] Checking for upcoming joiners...");

  try {
    // Calculate date range for "2 days from now"
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const twoDaysEnd = new Date(twoDaysFromNow);
    twoDaysEnd.setHours(23, 59, 59, 999);

    // Find pre-onboardings with joining date in 2 days that haven't been reminded
    const upcomingJoiners = await PreOnboarding.find({
      expectedJoiningDate: {
        $gte: twoDaysFromNow,
        $lte: twoDaysEnd,
      },
      overallStatus: { $nin: ["Dropped", "Completed"] },
      reminderSent: { $ne: true },
    })
      .populate("candidate", "name email")
      .populate("job", "title clientName");

    console.log(`[Reminder Job] Found ${upcomingJoiners.length} joiners in 2 days`);

    for (const po of upcomingJoiners) {
      try {
        const result = await sendJoiningReminderToTeams({
          candidateName: po.candidate?.name || "Unknown",
          jobTitle: po.job?.title || "N/A",
          joiningDate: po.expectedJoiningDate,
          clientName: po.clientName || po.job?.clientName || "",
        });

        if (result.success) {
          // Mark reminder as sent
          po.reminderSent = true;
          po.reminderSentAt = new Date();
          await po.save();
          console.log(`[Reminder Job] Sent reminder for ${po.candidate?.name}`);
        }
      } catch (err) {
        console.error(`[Reminder Job] Failed to send reminder for ${po._id}:`, err.message);
      }
    }

    console.log("[Reminder Job] Completed");
  } catch (error) {
    console.error("[Reminder Job] Error:", error.message);
  }
};

/**
 * Start the reminder cron job
 * Schedule: Every day at 9:00 AM
 */
export const startReminderJob = () => {
  // Run every day at 9:00 AM (server time)
  // Note: Adjust the hour based on your server's timezone
  // For IST (UTC+5:30), if server is UTC, use "30 3 * * *" for 9 AM IST
  cron.schedule("0 9 * * *", checkAndSendReminders);

  console.log("[Reminder Job] Scheduled to run daily at 9:00 AM");
};

// Export for manual testing
export const runReminderJobNow = checkAndSendReminders;

export default { startReminderJob, runReminderJobNow };
