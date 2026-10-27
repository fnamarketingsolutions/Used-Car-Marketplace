"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  InboxIcon,
  ListingIcon,
  OverviewIcon,
  SavedIcon,
  SettingsIcon,
  ShieldIcon,
} from "@/components/ui/NavIcons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", exact: true, icon: OverviewIcon },
  { href: "/dashboard/listings", label: "Listing", exact: false, icon: ListingIcon },
  { href: "/dashboard/saved", label: "Saved", exact: false, icon: SavedIcon },
  { href: "/dashboard/requests", label: "Request", exact: false, icon: InboxIcon },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    exact: false,
    icon: BellIcon,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    exact: false,
    icon: ShieldIcon,
  },
  {
    href: "/dashboard/profile",
    label: "Account Setting",
    exact: false,
    icon: SettingsIcon,
  },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-0.5 py-2">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition ${
              active
                ? "border-l-[3px] border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,white)] pl-[calc(0.75rem-3px)] font-semibold text-[var(--accent)]"
                : "border-l-[3px] border-transparent text-[var(--muted)] hover:bg-white/70 hover:text-[var(--ink)]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
