import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State is required"],
    },
    state: {
      type: String,
      required: [true, "State name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

citySchema.index({ stateId: 1, name: 1 }, { unique: true });
citySchema.index({ slug: 1 }, { unique: true });

const City = mongoose.model("City", citySchema);

export default City;
