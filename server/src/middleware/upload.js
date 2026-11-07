import multer from "multer";
import path from "path";
import AppError from "../utils/AppError.js";

// Allowed MIME types for resume uploads
const ALLOWED_MIMES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// Map MIME types to safe extensions
const MIME_TO_EXT = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename) => {
  // Remove path separators and null bytes
  return filename
    .replace(/[/\\]/g, "")
    .replace(/\0/g, "")
    .replace(/\.\./g, "");
};

const storage = multer.diskStorage({
  destination: "src/uploads",
  filename: (req, file, cb) => {
    // Use safe extension from MIME type, not from original filename
    const safeExt = MIME_TO_EXT[file.mimetype] || ".pdf";
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const safeName = `${timestamp}-${random}${safeExt}`;
    cb(null, safeName);
  },
});

export const resumeUpload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1, // Only 1 file at a time
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new AppError("Only PDF, DOC and DOCX files are allowed", 400));
    }
    // Sanitize the original name for logging/display purposes
    file.originalname = sanitizeFilename(file.originalname);
    cb(null, true);
  },
});