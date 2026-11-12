import nodemailer from "nodemailer";
import dns from "dns";
import { promisify } from "util";

const dnsLookup = promisify(dns.lookup);

// Cache the IPv4 address
let gmailIPv4 = null;

// Get Gmail SMTP IPv4 address
const getGmailIPv4 = async () => {
  if (gmailIPv4) return gmailIPv4;
  const result = await dnsLookup("smtp.gmail.com", { family: 4 });
  gmailIPv4 = result.address;
  console.log(`[Email] Resolved smtp.gmail.com to ${gmailIPv4}`);
  return gmailIPv4;
};

// Create Gmail SMTP transporter
const createTransporter = async () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn("SMTP credentials not configured. Emails will be logged only.");
    return null;
  }

  const ipv4 = await getGmailIPv4();

  return nodemailer.createTransport({
    host: ipv4,
    port: 587,
    secure: false,
    auth: {
      user,
      pass,
    },
    tls: {
      servername: "smtp.gmail.com",
    },
  });
};

// Send email helper
const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = await createTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!transporter) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    console.log(`[Email Mock] Body: ${text}`);
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PRE-ONBOARDING EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send email to Reporting Manager when joining date is set/updated
 */
export const sendJoiningDateNotification = async ({
  reportingManagerEmail,
  reportingManagerName,
  candidateName,
  jobTitle,
  joiningDate,
  isUpdate = false,
}) => {
  if (!reportingManagerEmail) {
    console.log("No reporting manager email provided, skipping notification");
    return { success: false, reason: "No email provided" };
  }

  const formattedDate = new Date(joiningDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const subject = isUpdate
    ? `[Update] Joining Date Changed - ${candidateName}`
    : `[New Hire] Joining Date Confirmed - ${candidateName}`;

  const text = `
Hi ${reportingManagerName || "Team"},

${isUpdate ? "The joining date has been updated for a candidate joining your team." : "A new candidate is scheduled to join your team."}

Candidate Details:
- Name: ${candidateName}
- Position: ${jobTitle}
- Joining Date: ${formattedDate}

Please ensure all necessary preparations are in place for their onboarding.

Best regards,
HR Team
iSpace Recruitment Management System
  `.trim();

  return sendEmail({
    to: reportingManagerEmail,
    subject,
    text,
  });
};

/**
 * Send reminder email to IT and Admin teams 2 days before joining
 */
export const sendJoiningReminderToTeams = async ({
  candidateName,
  jobTitle,
  joiningDate,
  clientName,
}) => {
  const itTeamEmail = process.env.IT_TEAM_EMAIL;
  const adminTeamEmail = process.env.ADMIN_TEAM_EMAIL;

  if (!itTeamEmail && !adminTeamEmail) {
    console.log("No IT/Admin team emails configured, skipping reminder");
    return { success: false, reason: "No team emails configured" };
  }

  const formattedDate = new Date(joiningDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const subject = `[Action Required] New Joiner in 2 Days - ${candidateName}`;

  const text = `
Hi Team,

This is a reminder that a new employee is joining in 2 days. Please ensure the following are ready:

Candidate Details:
- Name: ${candidateName}
- Position: ${jobTitle}
- Client/Project: ${clientName || "N/A"}
- Joining Date: ${formattedDate}

Required Preparations:
□ Laptop/Desktop and peripherals
□ System access and credentials
□ Email account setup
□ Seating arrangement
□ ID card preparation
□ Access cards/badges

Please coordinate and confirm readiness.

Best regards,
HR Team
iSpace Recruitment Management System
  `.trim();

  const results = [];

  if (itTeamEmail) {
    const itResult = await sendEmail({
      to: itTeamEmail,
      subject,
      text,
    });
    results.push({ team: "IT", ...itResult });
  }

  if (adminTeamEmail) {
    const adminResult = await sendEmail({
      to: adminTeamEmail,
      subject,
      text,
    });
    results.push({ team: "Admin", ...adminResult });
  }

  return { success: true, results };
};

export default {
  sendEmail,
  sendJoiningDateNotification,
  sendJoiningReminderToTeams,
};
