import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

/**
 * Reset a user's password (for accounts whose hash was corrupted by
 * accidental double-hashing).
 *
 * Usage:
 *   node scripts/resetUserPassword.js user@example.com NewPassword123
 *
 * Or via env:
 *   RESET_EMAIL=user@example.com RESET_PASSWORD=NewPassword123 node scripts/resetUserPassword.js
 */
const resetUserPassword = async () => {
  const email = (process.argv[2] || process.env.RESET_EMAIL || "")
    .toLowerCase()
    .trim();
  const password = process.argv[3] || process.env.RESET_PASSWORD;

  if (!email || !password) {
    console.error(
      "Usage: node scripts/resetUserPassword.js <email> <newPassword>\n" +
        "   or: RESET_EMAIL=... RESET_PASSWORD=... node scripts/resetUserPassword.js"
    );
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("Password must be at least 6 characters");
    process.exit(1);
  }

  try {
    await connectDB();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.error(`No user found for email: ${email}`);
      process.exit(1);
    }

    user.password = password;
    await user.save();

    console.log(`Password reset for ${email} (role: ${user.role})`);
  } catch (error) {
    console.error("Password reset failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

resetUserPassword();
