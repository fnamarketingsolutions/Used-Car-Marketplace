import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function IconShell({
  className = "h-4 w-4 shrink-0",
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function OverviewIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </IconShell>
  );
}

export function ListingIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M5 17h14v2H5z" />
      <path d="M7 17l1.2-5.5A2 2 0 0 1 10.15 10h3.7a2 2 0 0 1 1.95 1.5L17 17" />
      <circle cx="8.5" cy="17" r="1.25" />
      <circle cx="15.5" cy="17" r="1.25" />
      <path d="M9 10V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </IconShell>
  );
}

export function SavedIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1z" />
    </IconShell>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M5 6h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    </IconShell>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M4 8l8 5 8-5" />
      <rect x="3" y="5" width="18" height="14" rx="2" />
    </IconShell>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </IconShell>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 19a4.5 4.5 0 0 1 4.5-4" />
    </IconShell>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
    </IconShell>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" stroke="none" />
    </IconShell>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </IconShell>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M9 4l6 2 6-2v16l-6 2-6-2-6 2V6l6-2z" />
      <path d="M9 4v16M15 6v16" />
    </IconShell>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.25" />
    </IconShell>
  );
}

export function QueryIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
      <path d="M11 8a3 3 0 0 1 2.5 1.5" />
    </IconShell>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M4 19h16" />
      <path d="M7 16V10" />
      <path d="M12 16V6" />
      <path d="M17 16v-4" />
    </IconShell>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </IconShell>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </IconShell>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </IconShell>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </IconShell>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </IconShell>
  );
}
