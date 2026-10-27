import mongoose from "mongoose";
import City from "../models/City.js";
import CityRequest from "../models/CityRequest.js";
import State from "../models/State.js";
import StateRequest from "../models/StateRequest.js";
import {
  notifyAdminsOfLocationRequest,
  notifyUserOfLocationReview,
} from "../services/notification.service.js";
import { uniqueSlug } from "../utils/slugify.js";

const assertActiveStateName = async (stateName) => {
  const state = await State.findOne({
    name: new RegExp(`^${String(stateName).trim()}$`, "i"),
    isActive: true,
  });
  if (!state) {
    const err = new Error("State must be selected from the active state list");
    err.statusCode = 400;
    throw err;
  }
  return state;
};

const assertActiveStateById = async (stateId) => {
  if (!stateId || !String(stateId).trim()) {
    const err = new Error("stateId is required");
    err.statusCode = 400;
    throw err;
  }
  const state = await State.findOne({
    _id: stateId,
    isActive: true,
  });
  if (!state) {
    const err = new Error("State must be selected from the active state list");
    err.statusCode = 400;
    throw err;
  }
  return state;
};

const ensureCitySlug = async (name, excludeId = null) =>
  uniqueSlug(City, name, {}, excludeId);

const ensureOrCreateState = async (stateName) => {
  const trimmed = String(stateName).trim();
  let state = await State.findOne({
    name: new RegExp(`^${trimmed}$`, "i"),
  });

  if (state) {
    state.isActive = true;
    state.name = trimmed;
    await state.save();
    return state;
  }

  const slug = await uniqueSlug(State, trimmed);
  return State.create({
    name: trimmed,
    slug,
    isActive: true,
  });
};

const ensureOrCreateCity = async (cityName, stateDoc) => {
  let city = await City.findOne({
    name: new RegExp(`^${cityName}$`, "i"),
    stateId: stateDoc._id,
  });

  if (city) {
    city.isActive = true;
    city.name = cityName;
    city.stateId = stateDoc._id;
    city.state = stateDoc.name;
    if (!city.slug) {
      city.slug = await ensureCitySlug(cityName, city._id);
    }
    await city.save();
    return city;
  }

  const slug = await ensureCitySlug(cityName);
  return City.create({
    name: cityName,
    stateId: stateDoc._id,
    state: stateDoc.name,
    slug,
    isActive: true,
  });
};

const requesterDisplayName = (user) =>
  user?.fullName || user?.email || "A user";

export const listCities = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.all === "true" && req.user?.role === "admin") {
      delete filter.isActive;
    }

    if (req.query.stateId) {
      if (!mongoose.isValidObjectId(req.query.stateId)) {
        return res.status(400).json({ message: "Invalid stateId" });
      }
      filter.stateId = req.query.stateId;
    } else if (req.query.state) {
      filter.state = new RegExp(`^${String(req.query.state).trim()}$`, "i");
    }

    const cities = await City.find(filter)
      .populate("stateId", "name slug isActive")
      .sort({ state: 1, name: 1 });
    return res.status(200).json({ cities });
  } catch (error) {
    console.error("List cities error:", error);
    return res.status(500).json({ message: "Server error fetching cities" });
  }
};

export const createCity = async (req, res) => {
  try {
    const { name, stateId } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name and stateId are required" });
    }
    if (!stateId) {
      return res.status(400).json({ message: "Name and stateId are required" });
    }

    const activeState = await assertActiveStateById(stateId);
    const slug = await ensureCitySlug(name.trim());

    const city = await City.create({
      name: name.trim(),
      stateId: activeState._id,
      state: activeState.name,
      slug,
      isActive: true,
    });

    await city.populate("stateId", "name slug isActive");
    return res.status(201).json({ message: "City created", city });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "City already exists in this state" });
    }
    console.error("Create city error:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error creating city" });
  }
};

export const updateCity = async (req, res) => {
  try {
    const { name, stateId, isActive } = req.body;
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    if (name !== undefined) {
      city.name = name.trim();
      city.slug = await ensureCitySlug(city.name, city._id);
    }
    if (stateId !== undefined) {
      const activeState = await assertActiveStateById(stateId);
      city.stateId = activeState._id;
      city.state = activeState.name;
    }
    if (isActive !== undefined) city.isActive = Boolean(isActive);

    await city.save();
    await city.populate("stateId", "name slug isActive");
    return res.status(200).json({ message: "City updated", city });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "City already exists in this state" });
    }
    console.error("Update city error:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error updating city" });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    city.isActive = false;
    await city.save();
    return res.status(200).json({ message: "City deactivated", city });
  } catch (error) {
    console.error("Delete city error:", error);
    return res.status(500).json({ message: "Server error deleting city" });
  }
};

export const requestCity = async (req, res) => {
  try {
    const { cityName, stateId, isOther, stateName, reason } = req.body;
    if (!cityName || !String(cityName).trim()) {
      return res.status(400).json({ message: "City name is required" });
    }
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const trimmedCityName = String(cityName).trim();
    const trimmedReason = String(reason).trim();
    const requesterName = requesterDisplayName(req.user);

    // Other: new state name + city — create linked StateRequest + CityRequest
    if (isOther === true) {
      if (!stateName || !String(stateName).trim()) {
        return res.status(400).json({
          message: "stateName is required when requesting a new state (Other)",
        });
      }

      const trimmedStateName = String(stateName).trim();

      const existingState = await State.findOne({
        name: new RegExp(`^${trimmedStateName}$`, "i"),
        isActive: true,
      });
      if (existingState) {
        return res.status(409).json({
          message: "State already exists. Please select it from the list.",
          state: existingState,
        });
      }

      const duplicatePendingState = await StateRequest.findOne({
        stateName: new RegExp(`^${trimmedStateName}$`, "i"),
        status: "pending",
      });
      if (duplicatePendingState) {
        return res.status(409).json({
          message: "A pending request for this state already exists",
          request: duplicatePendingState,
        });
      }

      const duplicatePendingCity = await CityRequest.findOne({
        cityName: new RegExp(`^${trimmedCityName}$`, "i"),
        state: new RegExp(`^${trimmedStateName}$`, "i"),
        status: "pending",
      });
      if (duplicatePendingCity) {
        return res.status(409).json({
          message: "A pending request for this city already exists",
          request: duplicatePendingCity,
        });
      }

      const stateRequest = await StateRequest.create({
        user: req.user._id,
        stateName: trimmedStateName,
      });

      const request = await CityRequest.create({
        user: req.user._id,
        cityName: trimmedCityName,
        stateId: null,
        state: trimmedStateName,
        isNewState: true,
        stateRequest: stateRequest._id,
        reason: trimmedReason,
      });

      stateRequest.cityRequest = request._id;
      await stateRequest.save();

      await notifyAdminsOfLocationRequest({
        requestId: request._id,
        cityName: trimmedCityName,
        stateName: trimmedStateName,
        requesterName,
      });

      return res.status(201).json({
        message: "City and state request submitted",
        stateRequest,
        request,
      });
    }

    // Existing state selected by stateId
    if (!stateId) {
      return res.status(400).json({ message: "City name and stateId are required" });
    }

    const activeState = await assertActiveStateById(stateId);

    const existing = await City.findOne({
      name: new RegExp(`^${trimmedCityName}$`, "i"),
      stateId: activeState._id,
      isActive: true,
    });

    if (existing) {
      return res.status(409).json({
        message: "City already exists. Please select it from the list.",
        city: existing,
      });
    }

    const duplicatePending = await CityRequest.findOne({
      cityName: new RegExp(`^${trimmedCityName}$`, "i"),
      stateId: activeState._id,
      status: "pending",
    });

    if (duplicatePending) {
      return res.status(409).json({
        message: "A pending request for this city already exists",
        request: duplicatePending,
      });
    }

    const request = await CityRequest.create({
      user: req.user._id,
      cityName: trimmedCityName,
      stateId: activeState._id,
      state: activeState.name,
      isNewState: false,
      stateRequest: null,
      reason: trimmedReason,
    });

    await notifyAdminsOfLocationRequest({
      requestId: request._id,
      cityName: trimmedCityName,
      stateName: activeState.name,
      requesterName,
    });

    return res.status(201).json({ message: "City request submitted", request });
  } catch (error) {
    console.error("Request city error:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error requesting city" });
  }
};

export const listMyCityRequests = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const requests = await CityRequest.find(filter)
      .populate("stateId", "name slug isActive")
      .populate("stateRequest")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("List my city requests error:", error);
    return res.status(500).json({ message: "Server error fetching your requests" });
  }
};

export const listCityRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const requests = await CityRequest.find(filter)
      .populate("user", "fullName email")
      .populate("stateId", "name slug isActive")
      .populate("stateRequest")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("List city requests error:", error);
    return res.status(500).json({ message: "Server error fetching requests" });
  }
};

export const reviewCityRequest = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const request = await CityRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "City request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already reviewed" });
    }

    request.status = status;
    if (adminNote !== undefined) request.adminNote = String(adminNote).trim();

    let city = null;
    let state = null;

    if (status === "approved") {
      if (request.isNewState || request.stateRequest) {
        state = await ensureOrCreateState(request.state);
        city = await ensureOrCreateCity(request.cityName, state);
        request.stateId = state._id;
        request.state = state.name;

        if (request.stateRequest) {
          const linkedStateRequest = await StateRequest.findById(request.stateRequest);
          if (linkedStateRequest && linkedStateRequest.status === "pending") {
            linkedStateRequest.status = "approved";
            if (adminNote !== undefined) {
              linkedStateRequest.adminNote = String(adminNote).trim();
            }
            await linkedStateRequest.save();
          }
        }
      } else {
        const activeState = request.stateId
          ? await assertActiveStateById(request.stateId)
          : await assertActiveStateName(request.state);

        state = activeState;
        city = await ensureOrCreateCity(request.cityName, activeState);
      }
    } else if (request.stateRequest) {
      const linkedStateRequest = await StateRequest.findById(request.stateRequest);
      if (linkedStateRequest && linkedStateRequest.status === "pending") {
        linkedStateRequest.status = "rejected";
        if (adminNote !== undefined) {
          linkedStateRequest.adminNote = String(adminNote).trim();
        }
        await linkedStateRequest.save();
      }
    }

    await request.save();

    await notifyUserOfLocationReview({
      userId: request.user,
      requestId: request._id,
      cityName: request.cityName,
      stateName: request.state,
      status,
    });

    return res.status(200).json({
      message: `Request ${status}`,
      request,
      city,
      state,
    });
  } catch (error) {
    console.error("Review city request error:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error reviewing request" });
  }
};
