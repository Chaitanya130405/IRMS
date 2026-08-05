import Notification from "../models/Notification.js";
export const notify = (user, title, message) =>
  Notification.create({ user, title, message });
