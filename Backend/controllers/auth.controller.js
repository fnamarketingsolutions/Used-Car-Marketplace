import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import {
  clearAuthCookies,
  issueTokensForUser,
  setAuthCookies,
  verifyRefreshToken,
} from "../utils/tokens.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getRedirectTo = (user) =>
  user.role === "admin" ? "/admin/dashboard" : "/dashboard";

const isDuplicateKeyError = (error) => error?.code === 11000;

const duplicateFieldMessage = (error) => {
  const key = Object.keys(error.keyPattern || {})[0];
  if (key === "email") return "Email already registered";
  if (key === "phoneNumber") return "Phone number already registered";
  return "Account already exists";
};

export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
      console.log("fullName", fullName);
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }],
    });

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return res.status(409).json({ message: "Email already registered" });
      }
      return res.status(409).json({ message: "Phone number already registered" });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      password,
      role: "user",
    });

    const { accessToken, refreshToken } = await issueTokensForUser(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      message: "Registered successfully",
      token: refreshToken,
      accessToken: accessToken,
      redirectTo: getRedirectTo(user),
      user: user.toSafeObject(),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: duplicateFieldMessage(error) });
    }
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password +refreshToken"
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.accountStatus === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked. Contact support.",
        accountStatus: "blocked",
      });
    }

    const { accessToken, refreshToken } = await issueTokensForUser(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      message: "Logged in successfully",
      token: refreshToken,
      accessToken: accessToken,
      redirectTo: getRedirectTo(user),
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh token revoked or invalid" });
    }

    if (user.accountStatus === "blocked") {
      clearAuthCookies(res);
      return res.status(403).json({
        message: "Your account has been blocked. Contact support.",
        accountStatus: "blocked",
      });
    }

    const { accessToken, refreshToken } = await issueTokensForUser(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({ message: "Tokens refreshed" });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Server error during token refresh" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        const user = await User.findById(decoded.userId).select("+refreshToken");
        if (user) {
          user.refreshToken = null;
          await user.save({ validateBeforeSave: false });
        }
      } catch {
        // Ignore invalid refresh token on logout
      }
    } else if (req.user) {
      req.user.refreshToken = null;
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }

    clearAuthCookies(res);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    clearAuthCookies(res);
    return res.status(200).json({ message: "Logged out successfully" });
  }
};

export const me = async (req, res) => {
  return res.status(200).json({ user: req.user.toSafeObject() });
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({ message: "Full name is required" });
    }

    req.user.fullName = String(fullName).trim();
    await req.user.save();
    return res.status(200).json({ message: "Profile updated", user: req.user.toSafeObject() });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and current password are required" });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.email = email.toLowerCase().trim();
    await user.save();
    return res.status(200).json({ message: "Email updated", user: user.toSafeObject() });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: duplicateFieldMessage(error) });
    }
    console.error("Update email error:", error);
    return res.status(500).json({ message: "Server error updating email" });
  }
};

export const updatePhone = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    if (!phoneNumber || !String(phoneNumber).trim()) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Google-only users (no password) can set phone without current password.
    const hasPassword = Boolean(user.password);
    if (hasPassword) {
      if (!password) {
        return res
          .status(400)
          .json({ message: "Phone number and current password are required" });
      }
      if (!(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
    }

    user.phoneNumber = String(phoneNumber).trim();
    await user.save();
    return res.status(200).json({ message: "Phone updated", user: user.toSafeObject() });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: duplicateFieldMessage(error) });
    }
    console.error("Update phone error:", error);
    return res.status(500).json({ message: "Server error updating phone" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Password updated" });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({ message: "Server error updating password" });
  }
};

export const getNotificationSettings = async (req, res) => {
  return res.status(200).json({ notificationSettings: req.user.notificationSettings });
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const allowed = ["emailAlerts", "smsAlerts", "pushAlerts", "marketingEmails"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        req.user.notificationSettings[key] = Boolean(req.body[key]);
      }
    }
    await req.user.save();
    return res.status(200).json({
      message: "Notification settings updated",
      notificationSettings: req.user.notificationSettings,
    });
  } catch (error) {
    console.error("Update notification settings error:", error);
    return res.status(500).json({ message: "Server error updating notification settings" });
  }
};

export const getPrivacySettings = async (req, res) => {
  return res.status(200).json({ privacySettings: req.user.privacySettings });
};

export const updatePrivacySettings = async (req, res) => {
  try {
    const allowed = ["showPhoneToBuyers", "showEmailToBuyers", "profileVisible"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        req.user.privacySettings[key] = Boolean(req.body[key]);
      }
    }
    await req.user.save();
    return res.status(200).json({
      message: "Privacy settings updated",
      privacySettings: req.user.privacySettings,
    });
  } catch (error) {
    console.error("Update privacy settings error:", error);
    return res.status(500).json({ message: "Server error updating privacy settings" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message: "Google sign-in is not configured (missing GOOGLE_CLIENT_ID)",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const googleId = payload.sub;
    const email = String(payload.email).toLowerCase().trim();
    const fullName = (payload.name || email.split("@")[0] || "User").trim();

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.googleConnected = true;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({
        fullName,
        email,
        phoneNumber: null,
        googleId,
        googleConnected: true,
        role: "user",
      });
    }

    if (user.accountStatus === "blocked") {
      return res.status(403).json({ message: "Account is blocked" });
    }
    if (user.accountStatus === "suspended") {
      return res.status(403).json({
        message: user.suspendedReason || "Account is suspended",
      });
    }

    const { accessToken, refreshToken } = await issueTokensForUser(user);
    setAuthCookies(res, accessToken, refreshToken);

    const safe = user.toSafeObject();
    return res.status(200).json({
      message: "Logged in with Google",
      token: refreshToken,
      accessToken,
      redirectTo: getRedirectTo(user),
      needsPhone: !safe.phoneNumber,
      user: safe,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};

export const connectGoogle = async (req, res) => {
  try {
    const { googleId } = req.body;
    if (!googleId || !String(googleId).trim()) {
      return res.status(400).json({ message: "googleId is required (stub)" });
    }

    req.user.googleId = String(googleId).trim();
    req.user.googleConnected = true;
    await req.user.save();
    return res.status(200).json({
      message: "Google account connected (stub)",
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    console.error("Connect Google error:", error);
    return res.status(500).json({ message: "Server error connecting Google" });
  }
};

export const disconnectGoogle = async (req, res) => {
  try {
    req.user.googleId = null;
    req.user.googleConnected = false;
    await req.user.save();
    return res.status(200).json({
      message: "Google account disconnected",
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    console.error("Disconnect Google error:", error);
    return res.status(500).json({ message: "Server error disconnecting Google" });
  }
};
