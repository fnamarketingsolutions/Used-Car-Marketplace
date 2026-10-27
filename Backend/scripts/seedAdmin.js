import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { issueTokensForUser } from "../utils/tokens.js";

const DEFAULT_FULL_NAME = "Admin";
const DEFAULT_PHONE = "0000000000";

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("ADMIN_PASSWORD must be at least 6 characters");
    process.exit(1);
  }

  try {
    await connectDB();

    let admin = await User.findOne({ email }).select("+password +refreshToken");

    if (admin) {
      admin.password = password;
      admin.role = "admin";
      await admin.save();
      console.log(`Admin updated: ${email}`);
    } else {
      admin = await User.create({
        fullName: DEFAULT_FULL_NAME,
        email,
        phoneNumber: DEFAULT_PHONE,
        password,
        role: "admin",
      });
      console.log(`Admin created: ${email}`);
    }

    await issueTokensForUser(admin);
    console.log("Admin refresh token issued and saved");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedAdmin();
