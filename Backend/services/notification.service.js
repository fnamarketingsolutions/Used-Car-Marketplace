import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function notifyAdminsOfLocationRequest({
  requestId,
  cityName,
  stateName,
  requesterName,
}) {
  const admins = await User.find({ role: "admin" }).select("_id").lean();
  if (!admins.length) return;

  const name = requesterName || "A user";
  const location = [cityName, stateName].filter(Boolean).join(", ");
  const body = location
    ? `${name} requested ${location}`
    : `${name} submitted a location request`;

  await Notification.insertMany(
    admins.map((admin) => ({
      recipient: admin._id,
      type: "location_request_new",
      title: "New location request",
      body,
      link: "/admin/query",
      meta: {
        requestId: requestId || null,
        cityName: cityName || null,
        stateName: stateName || null,
        status: "pending",
        requesterName: name,
      },
      read: false,
    }))
  );
}

export async function notifyUserOfLocationReview({
  userId,
  requestId,
  cityName,
  stateName,
  status,
}) {
  if (!userId) return;

  const location = [cityName, stateName].filter(Boolean).join(", ");
  const statusLabel = status === "approved" ? "approved" : "rejected";
  const body = location
    ? `Your request for ${location} was ${statusLabel}`
    : `Your location request was ${statusLabel}`;

  await Notification.create({
    recipient: userId,
    type: "location_request_reviewed",
    title: "Location request update",
    body,
    link: "/dashboard/requests",
    meta: {
      requestId: requestId || null,
      cityName: cityName || null,
      stateName: stateName || null,
      status: status || null,
      requesterName: null,
    },
    read: false,
  });
}
