import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { dashboard } from "../controllers/dashboardController.js";
import { updateProfile } from "../controllers/profileController.js";
import {
  listNotifications,
  readNotification,
} from "../controllers/notificationController.js";
const r = Router();
r.use(protect);
r.get("/dashboard", dashboard);
r.patch("/profile", updateProfile);
r.get("/notifications", listNotifications);
r.patch("/notifications/:id/read", readNotification);
export default r;
