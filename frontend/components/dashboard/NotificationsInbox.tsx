"use client";

import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { formatNotificationTime } from "@/components/dashboard/NotificationCard";
import { BellIcon, RefreshIcon } from "@/components/ui/NavIcons";
import PageLoader from "@/components/ui/PageLoader";
import {
  listNotifications,
  markNotificationRead,
} from "@/lib/api/notifications";
import { ApiError, type AppNotification } from "@/lib/api/types";

const PAGE_SIZE = 50;

type Audience = "user" | "admin";

const COPY: Record<Audience, string> = {
  user: "City request updates from the admin, including approvals and rejections.",
  admin: "City and location requests submitted by users.",
};

function requesterName(notification: AppNotification) {
  return notification.meta?.requesterName?.trim() || "A user";
}

export default function NotificationsInbox({ audience }: { audience: Audience }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" | "more", skip = 0) => {
      if (mode === "refresh") setRefreshing(true);
      else if (mode === "more") setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await listNotifications(PAGE_SIZE, skip);
        const next = res.notifications || [];
        setHasMore(next.length === PAGE_SIZE);
        setNotifications((prev) => (mode === "more" ? [...prev, ...next] : next));
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load notifications"
        );
        if (mode === "initial") setNotifications([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    void load("initial", 0);
  }, [load]);

  async function onOpen(notification: AppNotification) {
    if (notification.read) return;
    try {
      await markNotificationRead(notification._id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? { ...item, read: true } : item
        )
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update notification"
      );
    }
  }

  return (
    <div>
      {audience === "admin" ? (
        <AdminPageHeader
          title="Notifications"
          description={COPY.admin}
          onRefresh={() => void load("refresh", 0)}
          refreshing={refreshing}
          titleIcon={<BellIcon className="h-6 w-6" />}
        />
      ) : (
        <DashboardPageHeader
          icon={BellIcon}
          iconBesideTitle
          title="Notifications"
          description={COPY.user}
        >
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--accent)] transition-transform duration-150 hover:text-[var(--accent-strong)] active:scale-90 active:rotate-45 disabled:opacity-60"
            onClick={() => void load("refresh", 0)}
            disabled={refreshing || loading}
            aria-label={refreshing ? "Refreshing" : "Refresh"}
            title={refreshing ? "Refreshing…" : "Refresh"}
          >
            <RefreshIcon
              className={`h-5 w-5 shrink-0 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </DashboardPageHeader>
      )}

      {error ? <p className="form-error mt-6 max-w-xl">{error}</p> : null}
      {loading ? (
        <PageLoader className="mt-8" label="Loading notifications…" />
      ) : null}

      {!loading && notifications.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted)]">No notifications yet</p>
      ) : null}

      {!loading && notifications.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-8">
          {notifications.map((notification) => {
            const time = formatNotificationTime(notification.createdAt);
            const body = notification.body?.trim() || "";
            return (
              <li
                key={notification._id}
                className={notification.read ? "opacity-80" : undefined}
              >
                <div className="relative">
                  <div
                    className="absolute -top-3 -left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--accent)] text-white shadow-md"
                    aria-hidden
                  >
                    <BellIcon className="h-4 w-4" />
                  </div>

                  <button
                    type="button"
                    className="w-full rounded-lg border border-[var(--line)] bg-white py-3.5 pr-4 pl-8 text-left shadow-sm"
                    onClick={() => void onOpen(notification)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-[#111111]">
                        {!notification.read ? (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                            aria-hidden
                          />
                        ) : null}
                        {audience === "user"
                          ? "by Admin"
                          : requesterName(notification)}
                      </p>
                      {time ? (
                        <time
                          dateTime={notification.createdAt}
                          className="ml-auto shrink-0 text-base font-medium text-[var(--accent)]"
                        >
                          {time}
                        </time>
                      ) : null}
                    </div>
                    {body ? (
                      <p className="mt-1.5 text-sm text-[var(--muted)]">{body}</p>
                    ) : null}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {!loading && hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="text-sm font-semibold text-[#E53E3E] disabled:opacity-60"
            disabled={loadingMore}
            onClick={() => void load("more", notifications.length)}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}