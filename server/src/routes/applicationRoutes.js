import { Router } from "express";
import * as c from "../controllers/applicationController.js";
import { protect, authorize } from "../middleware/auth.js";
import { resumeUpload } from "../middleware/upload.js";
const r = Router();
r.use(protect);
r.get("/", c.listApplications);
r.post(
  "/",
  authorize("candidate"),
  resumeUpload.single("resume"),
  c.createApplication,
);
r.get("/:id", c.getApplication);
r.patch("/:id/status", authorize("admin"), c.updateStatus);
r.patch("/:id/withdraw", authorize("candidate"), c.withdraw);
export default r;
