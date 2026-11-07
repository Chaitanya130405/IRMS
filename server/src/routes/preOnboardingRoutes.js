import { Router } from "express";
import * as c from "../controllers/preOnboardingController.js";
import { protect, authorize } from "../middleware/auth.js";

const r = Router();

// All routes require authentication and admin role
r.use(protect);
r.use(authorize("admin", "superadmin"));

// Dashboard and export
r.get("/dashboard", c.getPreOnboardingDashboard);
r.get("/export", c.exportPreOnboardings);

// CRUD operations
r.get("/", c.listPreOnboardings);
r.post("/application/:applicationId", c.createPreOnboarding);
r.get("/application/:applicationId", c.getPreOnboardingByApplication);
r.get("/:id", c.getPreOnboarding);
r.patch("/:id", c.updatePreOnboarding);

// Activity operations
r.post("/:id/activities", c.addActivity);
r.patch("/:id/activities/:activityId", c.updateActivity);

export default r;
