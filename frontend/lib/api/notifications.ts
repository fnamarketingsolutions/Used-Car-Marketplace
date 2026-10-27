import { apiFetch } from "./client";
import type {
  AppNotification,
  NotificationsResponse,
  UnreadCountResponse,
} from "./types";

export function listNotifications(limit = 30, skip = 0) {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });
  return apiFetch<NotificationsResponse>(`/api/notifications?${params}`, {
    method: "GET",
  });
}

export function getUnreadNotificationCount() {
  return apiFetch<UnreadCountResponse>("/api/notifications/unread-count", {
    method: "GET",
  });
}

export function markNotificationRead(id: string) {
  return apiFetch<{ message: string; notification: AppNotification }>(
    `/api/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH" }
  );
}

export function markAllNotificationsRead() {
  return apiFetch<{ message: string; modifiedCount: number }>(
    "/api/notifications/read-all",
    { method: "PATCH" }
  );
}
