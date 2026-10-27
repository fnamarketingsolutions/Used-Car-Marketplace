import City from "../models/City.js";
import CityRequest from "../models/CityRequest.js";
import State from "../models/State.js";
import StateRequest from "../models/StateRequest.js";
import {
  notifyAdminsOfLocationRequest,
  notifyUserOfLocationReview,
} from "../services/notification.service.js";
import { uniqueSlug } from "../utils/slugify.js";

const ensureCitySlug = async (name, excludeId = null) =>
  uniqueSlug(City, name, {}, excludeId);

export const listStates = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.all === "true" && req.user?.role === "admin") {
      delete filter.isActive;
    }
    const states = await State.find(filter).sort({ name: 1 });
    return res.status(200).json({ states });
  } catch (error) {
    console.error("List states error:", error);
    return res.status(500).json({ message: "Server error fetching states" });
  }
};

export const createState = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "State name is required" });
    }

    const trimmed = String(name).trim();
    const slug = await uniqueSlug(State, trimmed);
    const state = await State.create({
      name: trimmed,
      slug,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return res.status(201).json({ message: "State created", state });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "State already exists" });
    }
    console.error("Create state error:", error);
    return res.status(500).json({ message: "Server error creating state" });
  }
};

export const updateState = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }

    if (req.body.name !== undefined) {
      const trimmed = String(req.body.name).trim();
      state.name = trimmed;
      state.slug = await uniqueSlug(State, trimmed, {}, state._id);
    }
    if (req.body.isActive !== undefined) {
      state.isActive = Boolean(req.body.isActive);
    }

    await state.save();
    return res.status(200).json({ message: "State updated", state });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "State already exists" });
    }
    console.error("Update state error:", error);
    return res.status(500).json({ message: "Server error updating state" });
  }
};

export const deleteState = async (req, res) => {
  try {
    const state = await State.findById(req.params.id);
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    state.isActive = false;
    await state.save();
    return res.status(200).json({ message: "State deactivated", state });
  } catch (error) {
    console.error("Delete state error:", error);
    return res.status(500).json({ message: "Server error deleting state" });
  }
};

export const requestState = async (req, res) => {
  try {
    const { stateName } = req.body;
    if (!stateName || !String(stateName).trim()) {
      return res.status(400).json({ message: "State name is required" });
    }

    const trimmed = String(stateName).trim();
    const existing = await State.findOne({
      name: new RegExp(`^${trimmed}$`, "i"),
      isActive: true,
    });

    if (existing) {
      return res.status(409).json({
        message: "State already exists. Please select it from the list.",
        state: existing,
      });
    }

    const duplicatePending = await StateRequest.findOne({
      stateName: new RegExp(`^${trimmed}$`, "i"),
      status: "pending",
      cityRequest: null,
    });
    if (duplicatePending) {
      return res.status(409).json({
        message: "A pending request for this state already exists",
        request: duplicatePending,
      });
    }

    const request = await StateRequest.create({
      user: req.user._id,
      stateName: trimmed,
    });

    await notifyAdminsOfLocationRequest({
      requestId: request._id,
      cityName: null,
      stateName: trimmed,
      requesterName: req.user?.fullName || req.user?.email || "A user",
    });

    return res.status(201).json({ message: "State request submitted", request });
  } catch (error) {
    console.error("Request state error:", error);
    return res.status(500).json({ message: "Server error requesting state" });
  }
};

export const listStateRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const requests = await StateRequest.find(filter)
      .populate("user", "fullName email")
      .populate("cityRequest")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("List state requests error:", error);
    return res.status(500).json({ message: "Server error fetching state requests" });
  }
};

export const reviewStateRequest = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }

    const request = await StateRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "State request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already reviewed" });
    }

    request.status = status;
    if (adminNote !== undefined) request.adminNote = String(adminNote).trim();

    let state = null;
    let city = null;

    // Linked to a city Other-request: approve/reject both and create state+city
    if (request.cityRequest) {
      const linkedCityRequest = await CityRequest.findById(request.cityRequest);

      if (status === "approved") {
        state = await State.findOne({
          name: new RegExp(`^${request.stateName}$`, "i"),
        });

        if (state) {
          state.isActive = true;
          state.name = request.stateName;
          await state.save();
        } else {
          const slug = await uniqueSlug(State, request.stateName);
          state = await State.create({
            name: request.stateName,
            slug,
            isActive: true,
          });
        }

        if (linkedCityRequest) {
          city = await City.findOne({
            name: new RegExp(`^${linkedCityRequest.cityName}$`, "i"),
            stateId: state._id,
          });

          if (city) {
            city.isActive = true;
            city.name = linkedCityRequest.cityName;
            city.stateId = state._id;
            city.state = state.name;
            if (!city.slug) {
              city.slug = await ensureCitySlug(linkedCityRequest.cityName, city._id);
            }
            await city.save();
          } else {
            const slug = await ensureCitySlug(linkedCityRequest.cityName);
            city = await City.create({
              name: linkedCityRequest.cityName,
              stateId: state._id,
              state: state.name,
              slug,
              isActive: true,
            });
          }

          if (linkedCityRequest.status === "pending") {
            linkedCityRequest.status = "approved";
            linkedCityRequest.stateId = state._id;
            linkedCityRequest.state = state.name;
            if (adminNote !== undefined) {
              linkedCityRequest.adminNote = String(adminNote).trim();
            }
            await linkedCityRequest.save();
          }
        }
      } else if (linkedCityRequest && linkedCityRequest.status === "pending") {
        linkedCityRequest.status = "rejected";
        if (adminNote !== undefined) {
          linkedCityRequest.adminNote = String(adminNote).trim();
        }
        await linkedCityRequest.save();
      }

      await request.save();

      const cityName = linkedCityRequest?.cityName || null;
      await notifyUserOfLocationReview({
        userId: request.user,
        requestId: linkedCityRequest?._id || request._id,
        cityName,
        stateName: request.stateName,
        status,
      });

      return res.status(200).json({
        message: `Request ${status}`,
        request,
        state,
        city,
      });
    }

    if (status === "approved") {
      state = await State.findOne({
        name: new RegExp(`^${request.stateName}$`, "i"),
      });

      if (state) {
        state.isActive = true;
        state.name = request.stateName;
        await state.save();
      } else {
        const slug = await uniqueSlug(State, request.stateName);
        state = await State.create({
          name: request.stateName,
          slug,
          isActive: true,
        });
      }
    }

    await request.save();

    await notifyUserOfLocationReview({
      userId: request.user,
      requestId: request._id,
      cityName: null,
      stateName: request.stateName,
      status,
    });

    return res.status(200).json({ message: `Request ${status}`, request, state });
  } catch (error) {
    console.error("Review state request error:", error);
    return res.status(500).json({ message: "Server error reviewing state request" });
  }
};
