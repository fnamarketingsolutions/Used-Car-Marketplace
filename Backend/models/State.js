import mongoose from "mongoose";

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "State name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const State = mongoose.model("State", stateSchema);

export default State;
