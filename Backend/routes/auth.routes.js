import { Router } from "express";
import {
  connectGoogle,
  disconnectGoogle,
  getNotificationSettings,
  getPrivacySettings,
  googleLogin,
  login,
  logout,
  me,
  refresh,
  register,
  updateEmail,
  updateNotificationSettings,
  updatePassword,
  updatePhone,
  updatePrivacySettings,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);

router.patch("/profile", protect, updateProfile);
router.patch("/email", protect, updateEmail);
router.patch("/phone", protect, updatePhone);
router.patch("/password", protect, updatePassword);

router.get("/notifications", protect, getNotificationSettings);
router.patch("/notifications", protect, updateNotificationSettings);
router.get("/privacy", protect, getPrivacySettings);
router.patch("/privacy", protect, updatePrivacySettings);

router.post("/google/connect", protect, connectGoogle);
router.delete("/google/disconnect", protect, disconnectGoogle);

export default router;
