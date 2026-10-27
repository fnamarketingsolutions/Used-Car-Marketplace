import User from "../models/User.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no access token" });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    if (user.accountStatus === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked. Contact support.",
        accountStatus: "blocked",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

/** Attach req.user when a valid access token exists; never 401. */
export const optionalProtect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (user && user.accountStatus !== "blocked") {
      req.user = user;
    }
  } catch {
    // Invalid/expired token — treat as guest
  }
  return next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
};
