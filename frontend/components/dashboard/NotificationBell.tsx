"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NotificationCard from "@/components/dashboard/NotificationCard";
import { BellIcon } from "@/components/ui/NavIcons";
import Spinner from "@/components/ui/Spinner";
import {
  getUnreadNotificationCount,
  listNotifications,
  markNotificationRead,
} from "@/lib/api/notifications";
import type { AppNotification } from "@/lib/api/types";

const POLL_MS = 60_000;

const DROPDOWN_LIMIT = 3;

export default function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const notificationsHref = pathname.startsWith("/admin")
    ? "/admin/notifications"
    : "/dashboard/notifications";
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const refreshUnread = useCallback(async () => {
    try {
      const res = await getUnreadNotificationCount();
      setUnreadCount(res.count || 0);
    } catch {
      // Keep last known count on transient errors
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
    const id = window.setInterval(() => {
      void refreshUnread();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [refreshUnread]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await listNotifications(DROPDOWN_LIMIT);
        if (active) setNotifications(res.notifications || []);
        await refreshUnread();
      } catch {
        if (active) setNotifications([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, refreshUnread]);

  async function onClickNotification(notification: AppNotification) {
    setOpen(false);
    if (!notification.read) {
      try {
        await markNotificationRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // Navigation still proceeds
      }
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  const badgeLabel =
    unreadCount > 99 ? "99+" : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon className="h-5 w-5" />
        {badgeLabel ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold leading-none text-white">
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] border border-[var(--line)] bg-white p-3 shadow-lg"
        >
          <p className="border-b border-[var(--line)] pb-2 text-sm font-semibold text-[var(--ink)]">
            Notifications
          </p>
          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--muted)]">
              No notifications yet
            </p>
          ) : (
            <ul className="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  compact
                  onClick={() => void onClickNotification(notification)}
                />
              ))}
            </ul>
          )}
          <Link
            href={notificationsHref}
            className="mt-2 block border-t border-[var(--line)] pt-2 text-center text-sm font-semibold text-[#E53E3E]"
            onClick={() => setOpen(false)}
          >
            View more
          </Link>
        </div>
      ) : null}
    </div>
  );
}
