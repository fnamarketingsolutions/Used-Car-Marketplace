import mongoose from "mongoose";

const platformSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },
    siteName: {
      type: String,
      default: "Used Car Marketplace",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "",
      trim: true,
    },
    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    maxPhotosPerListing: {
      type: Number,
      default: 20,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    extra: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const PlatformSetting = mongoose.model("PlatformSetting", platformSettingSchema);

export default PlatformSetting;
