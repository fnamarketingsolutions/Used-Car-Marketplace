import mongoose from "mongoose";

const stateRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stateName: {
      type: String,
      required: [true, "State name is required"],
      trim: true,
    },
    cityRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CityRequest",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const StateRequest = mongoose.model("StateRequest", stateRequestSchema);

export default StateRequest;
