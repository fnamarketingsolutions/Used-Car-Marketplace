import Notification from "../models/Notification.js";

export const listNotifications = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 50);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("List notifications error:", error);
    return res.status(500).json({ message: "Server error fetching notifications" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Unread notification count error:", error);
    return res.status(500).json({ message: "Server error fetching unread count" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { returnDocument: "after" }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({ message: "Server error updating notification" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );
    return res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return res.status(500).json({ message: "Server error updating notifications" });
  }
};
