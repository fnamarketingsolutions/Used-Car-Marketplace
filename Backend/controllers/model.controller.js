import Make from "../models/Make.js";
import VehicleModel from "../models/Model.js";
import { uniqueSlug } from "../utils/slugify.js";

export const listModels = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.all === "true" && req.user?.role === "admin") {
      delete filter.isActive;
    }

    const makeParam = req.query.make;
    if (makeParam) {
      if (/^[a-f\d]{24}$/i.test(String(makeParam))) {
        filter.make = makeParam;
      } else {
        const makeDoc = await Make.findOne({
          $or: [
            { name: new RegExp(`^${String(makeParam).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
            { slug: String(makeParam).toLowerCase() },
          ],
        });
        if (!makeDoc) {
          return res.status(200).json({ models: [] });
        }
        filter.make = makeDoc._id;
      }
    }

    const models = await VehicleModel.find(filter)
      .populate("make", "name slug isActive")
      .sort({ name: 1 });
    return res.status(200).json({ models });
  } catch (error) {
    console.error("List models error:", error);
    return res.status(500).json({ message: "Server error fetching models" });
  }
};

export const createModel = async (req, res) => {
  try {
    const { name, make, isActive } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Model name is required" });
    }
    if (!make) {
      return res.status(400).json({ message: "Make is required" });
    }

    const makeDoc = await Make.findById(make);
    if (!makeDoc) {
      return res.status(404).json({ message: "Make not found" });
    }

    const trimmed = String(name).trim();
    const slug = await uniqueSlug(VehicleModel, trimmed, { make: makeDoc._id });
    const model = await VehicleModel.create({
      name: trimmed,
      slug,
      make: makeDoc._id,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    await model.populate("make", "name slug isActive");
    return res.status(201).json({ message: "Model created", model });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Model already exists for this make" });
    }
    console.error("Create model error:", error);
    return res.status(500).json({ message: "Server error creating model" });
  }
};

export const updateModel = async (req, res) => {
  try {
    const model = await VehicleModel.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }

    if (req.body.make !== undefined) {
      const makeDoc = await Make.findById(req.body.make);
      if (!makeDoc) {
        return res.status(404).json({ message: "Make not found" });
      }
      model.make = makeDoc._id;
    }

    if (req.body.name !== undefined) {
      const trimmed = String(req.body.name).trim();
      model.name = trimmed;
      model.slug = await uniqueSlug(
        VehicleModel,
        trimmed,
        { make: model.make },
        model._id
      );
    }

    if (req.body.isActive !== undefined) {
      model.isActive = Boolean(req.body.isActive);
    }

    await model.save();
    await model.populate("make", "name slug isActive");
    return res.status(200).json({ message: "Model updated", model });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Model already exists for this make" });
    }
    console.error("Update model error:", error);
    return res.status(500).json({ message: "Server error updating model" });
  }
};

export const deleteModel = async (req, res) => {
  try {
    const model = await VehicleModel.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: "Model not found" });
    }
    model.isActive = false;
    await model.save();
    await model.populate("make", "name slug isActive");
    return res.status(200).json({ message: "Model deactivated", model });
  } catch (error) {
    console.error("Delete model error:", error);
    return res.status(500).json({ message: "Server error deleting model" });
  }
};
