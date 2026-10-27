import mongoose from "mongoose";

const makeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Make name is required"],
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

const Make = mongoose.model("Make", makeSchema);

export default Make;
