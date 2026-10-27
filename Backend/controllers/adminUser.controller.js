import User from "../models/User.js";
import Listing from "../models/Listing.js";

export const listUsers = async (req, res) => {
  try {
    const filter = { role: { $ne: "admin" } };
    if (req.query.status) filter.accountStatus = req.query.status;
    if (req.query.q) {
      const q = req.query.q.trim();
      filter.$or = [
        { fullName: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { phoneNumber: new RegExp(q, "i") },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ users: users.map((u) => u.toSafeObject()) });
  } catch (error) {
    console.error("List users error:", error);
    return res.status(500).json({ message: "Server error listing users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    const listings = await Listing.find({ seller: user._id })
      .select("variant bodyType manufacturingYear status askingPrice slug viewCount createdAt")
      .sort({ updatedAt: -1 });

    const listingStats = {
      total: listings.length,
      live: listings.filter((l) => l.status === "Live").length,
      paused: listings.filter((l) => l.status === "Paused").length,
      sold: listings.filter((l) => l.status === "Sold").length,
      removed: listings.filter((l) => l.status === "Removed").length,
    };

    return res.status(200).json({
      user: user.toSafeObject(),
      listingStats,
      listings,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Server error fetching user" });
  }
};

export const warnUser = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: "Warning message is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    user.warnings.push({
      message: String(message).trim(),
      admin: req.user._id,
    });
    await user.save();

    return res.status(200).json({
      message: "Warning sent",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Warn user error:", error);
    return res.status(500).json({ message: "Server error warning user" });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.accountStatus === "blocked") {
      return res.status(400).json({ message: "User is blocked; unblock first" });
    }

    user.accountStatus = "suspended";
    user.suspendedAt = new Date();
    user.suspendedReason = reason ? String(reason).trim() : "Suspended by admin";
    await user.save();

    return res.status(200).json({
      message: "User suspended",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    return res.status(500).json({ message: "Server error suspending user" });
  }
};

export const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.accountStatus !== "suspended") {
      return res.status(400).json({ message: "User is not suspended" });
    }

    user.accountStatus = "active";
    user.suspendedAt = null;
    user.suspendedReason = null;
    await user.save();

    return res.status(200).json({
      message: "User unsuspended",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Unsuspend user error:", error);
    return res.status(500).json({ message: "Server error unsuspending user" });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id).select("+refreshToken");
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    user.accountStatus = "blocked";
    user.blockedAt = new Date();
    user.blockedReason = reason ? String(reason).trim() : "Blocked by admin";
    user.refreshToken = null;
    await user.save();

    return res.status(200).json({
      message: "User blocked",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Block user error:", error);
    return res.status(500).json({ message: "Server error blocking user" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.accountStatus !== "blocked") {
      return res.status(400).json({ message: "User is not blocked" });
    }

    user.accountStatus = "active";
    user.blockedAt = null;
    user.blockedReason = null;
    user.suspendedAt = null;
    user.suspendedReason = null;
    await user.save();

    return res.status(200).json({
      message: "User unblocked",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Unblock user error:", error);
    return res.status(500).json({ message: "Server error unblocking user" });
  }
};
