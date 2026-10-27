import Make from "../models/Make.js";
import VehicleModel from "../models/Model.js";
import { uniqueSlug } from "../utils/slugify.js";

export const listMakes = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.all === "true" && req.user?.role === "admin") {
      delete filter.isActive;
    }
    const makes = await Make.find(filter).sort({ name: 1 });
    return res.status(200).json({ makes });
  } catch (error) {
    console.error("List makes error:", error);
    return res.status(500).json({ message: "Server error fetching makes" });
  }
};

export const createMake = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Make name is required" });
    }

    const trimmed = String(name).trim();
    const slug = await uniqueSlug(Make, trimmed);
    const make = await Make.create({
      name: trimmed,
      slug,
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    return res.status(201).json({ message: "Make created", make });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Make already exists" });
    }
    console.error("Create make error:", error);
    return res.status(500).json({ message: "Server error creating make" });
  }
};

export const updateMake = async (req, res) => {
  try {
    const make = await Make.findById(req.params.id);
    if (!make) {
      return res.status(404).json({ message: "Make not found" });
    }

    if (req.body.name !== undefined) {
      const trimmed = String(req.body.name).trim();
      make.name = trimmed;
      make.slug = await uniqueSlug(Make, trimmed, {}, make._id);
    }
    if (req.body.isActive !== undefined) {
      make.isActive = Boolean(req.body.isActive);
    }

    await make.save();
    return res.status(200).json({ message: "Make updated", make });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Make already exists" });
    }
    console.error("Update make error:", error);
    return res.status(500).json({ message: "Server error updating make" });
  }
};

export const deleteMake = async (req, res) => {
  try {
    const make = await Make.findById(req.params.id);
    if (!make) {
      return res.status(404).json({ message: "Make not found" });
    }
    make.isActive = false;
    await make.save();
    await VehicleModel.updateMany({ make: make._id }, { isActive: false });
    return res.status(200).json({ message: "Make deactivated", make });
  } catch (error) {
    console.error("Delete make error:", error);
    return res.status(500).json({ message: "Server error deleting make" });
  }
};
