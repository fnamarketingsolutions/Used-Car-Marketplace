import mongoose from "mongoose";

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Model name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    make: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Make",
      required: [true, "Make is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

modelSchema.index({ make: 1, slug: 1 }, { unique: true });
modelSchema.index({ make: 1, name: 1 }, { unique: true });

const VehicleModel = mongoose.model("VehicleModel", modelSchema);

export default VehicleModel;
