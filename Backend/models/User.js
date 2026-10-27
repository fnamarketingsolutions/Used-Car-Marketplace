import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const warningSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const notificationSettingsSchema = new mongoose.Schema(
  {
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: false },
    pushAlerts: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
  },
  { _id: false }
);

const privacySettingsSchema = new mongoose.Schema(
  {
    showPhoneToBuyers: { type: Boolean, default: true },
    showEmailToBuyers: { type: Boolean, default: false },
    profileVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
      // Sparse unique: multiple Google users may have no phone yet
      sparse: true,
      unique: true,
      required: [
        function requirePhone() {
          return !this.googleConnected;
        },
        "Phone number is required",
      ],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
      default: undefined,
      required: [
        function requirePassword() {
          return !this.googleConnected;
        },
        "Password is required",
      ],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "blocked"],
      default: "active",
      index: true,
    },
    warnings: { type: [warningSchema], default: [] },
    suspendedAt: { type: Date, default: null },
    suspendedReason: { type: String, default: null, trim: true },
    blockedAt: { type: Date, default: null },
    blockedReason: { type: String, default: null, trim: true },
    notificationSettings: {
      type: notificationSettingsSchema,
      default: () => ({}),
    },
    privacySettings: {
      type: privacySettingsSchema,
      default: () => ({}),
    },
    googleId: { type: String, default: null, trim: true, sparse: true, unique: true },
    googleConnected: { type: Boolean, default: false },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  // Skip if already a bcrypt hash (prevents accidental double-hashing).
  if (/^\$2[aby]\$/.test(this.password)) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    phoneNumber: this.phoneNumber || null,
    role: this.role,
    accountStatus: this.accountStatus,
    warnings: this.warnings,
    suspendedAt: this.suspendedAt,
    suspendedReason: this.suspendedReason,
    blockedAt: this.blockedAt,
    blockedReason: this.blockedReason,
    notificationSettings: this.notificationSettings,
    privacySettings: this.privacySettings,
    googleConnected: this.googleConnected,
    googleId: this.googleId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
