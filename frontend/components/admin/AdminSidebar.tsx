"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  ChartIcon,
  LayersIcon,
  ListingIcon,
  MapIcon,
  OverviewIcon,
  PinIcon,
  QueryIcon,
  SettingsIcon,
  ShieldIcon,
  TagIcon,
  UsersIcon,
} from "@/components/ui/NavIcons";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", exact: true, icon: OverviewIcon },
  { href: "/admin/users", label: "User management", exact: false, icon: UsersIcon },
  {
    href: "/admin/listings",
    label: "Listing management",
    exact: false,
    icon: ListingIcon,
  },
  { href: "/admin/moderation", label: "Reports", exact: false, icon: ShieldIcon },
  { href: "/admin/makes", label: "Make management", exact: false, icon: TagIcon },
  {
    href: "/admin/models",
    label: "Model management",
    exact: false,
    icon: LayersIcon,
  },
  { href: "/admin/states", label: "State management", exact: false, icon: MapIcon },
  { href: "/admin/cities", label: "City management", exact: false, icon: PinIcon },
  {
    href: "/admin/notifications",
    label: "Notifications",
    exact: false,
    icon: BellIcon,
  },
  { href: "/admin/query", label: "Query", exact: false, icon: QueryIcon },
  { href: "/admin/analytics", label: "Analytics", exact: false, icon: ChartIcon },
  { href: "/admin/settings", label: "Settings", exact: false, icon: SettingsIcon },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5 py-2">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-base transition ${
              active
                ? "border-l-[3px] border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,white)] pl-[calc(0.75rem-3px)] font-semibold text-[var(--ink)]"
                : "border-l-[3px] border-transparent font-medium text-[var(--ink)] hover:bg-white/70"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0 text-[var(--accent)]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
