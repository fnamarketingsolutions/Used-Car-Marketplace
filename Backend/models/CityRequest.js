import mongoose from "mongoose";

const cityRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cityName: {
      type: String,
      required: [true, "City name is required"],
      trim: true,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      default: null,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    isNewState: {
      type: Boolean,
      default: false,
    },
    stateRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StateRequest",
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
    reason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const CityRequest = mongoose.model("CityRequest", cityRequestSchema);

export default CityRequest;
