import type { AppNotification } from "@/lib/api/types";

export function formatNotificationTime(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function requesterName(notification: AppNotification) {
  return notification.meta?.requesterName?.trim() || "";
}

function messageBelowName(notification: AppNotification, name: string) {
  const body = notification.body?.trim() || "";
  if (!name) return body;
  if (body.toLowerCase().startsWith(name.toLowerCase())) {
    return body.slice(name.length).trim();
  }
  return body;
}

export default function NotificationCard({
  notification,
  onClick,
  compact = false,
}: {
  notification: AppNotification;
  onClick: () => void;
  compact?: boolean;
}) {
  const time = formatNotificationTime(notification.createdAt);
  const name = requesterName(notification);
  const message = messageBelowName(notification, name);

  return (
    <li>
      <button
        type="button"
        className={`w-full rounded-md border border-[var(--line)] bg-white text-left ${
          compact ? "px-3 py-2.5" : "px-4 py-3.5"
        } ${notification.read ? "opacity-80" : ""}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {!notification.read ? (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                aria-hidden
              />
            ) : null}
            {name ? (
              <p className="truncate text-sm font-semibold text-[#111111]">{name}</p>
            ) : null}
          </div>
          {time ? (
            <time
              dateTime={notification.createdAt}
              className="shrink-0 text-base font-medium text-[var(--accent)]"
            >
              {time}
            </time>
          ) : null}
        </div>
        {message ? (
          <p
            className={`text-sm text-[var(--muted)] ${compact ? "mt-1" : "mt-1.5"} ${
              !notification.read ? "pl-3.5" : ""
            }`}
          >
            {message}
          </p>
        ) : null}
      </button>
    </li>
  );
}
