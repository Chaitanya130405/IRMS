import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { dashboard } from "../controllers/dashboardController.js";
import { updateProfile } from "../controllers/profileController.js";
import {
  listNotifications,
  readNotification,
} from "../controllers/notificationController.js";
import {
  createAdmin,
  listManagedUsers,
  updateUserStatus,
} from "../controllers/userController.js";
const r = Router();
r.use(protect);
r.get("/dashboard", authorize("candidate", "admin"), dashboard);
r.patch("/profile", updateProfile);
r.get("/notifications", listNotifications);
r.patch("/notifications/:id/read", readNotification);
r.get("/users", authorize("superadmin"), listManagedUsers);
r.post("/users/admins", authorize("superadmin"), createAdmin);
r.patch("/users/:id/status", authorize("superadmin"), updateUserStatus);
export default r;
