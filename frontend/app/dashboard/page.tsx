"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import PageLoader from "@/components/ui/PageLoader";
import {
  ArrowRightIcon,
  ChartIcon,
  InboxIcon,
  LayersIcon,
  ListingIcon,
  SavedIcon,
} from "@/components/ui/NavIcons";
import { useAuth } from "@/lib/auth/AuthProvider";
import { getDashboard } from "@/lib/api/dashboard";
import { ApiError, type DashboardResponse } from "@/lib/api/types";

type TileIcon = ComponentType<{ className?: string }>;

const TILES: {
  key: string;
  label: string;
  href: string;
  icon: TileIcon;
  value: (d: DashboardResponse) => number;
}[] = [
  {
    key: "active",
    label: "Active listings",
    href: "/dashboard/listings",
    icon: ListingIcon,
    value: (d) => d.sell.active,
  },
  {
    key: "draft",
    label: "Drafts",
    href: "/dashboard/listings",
    icon: LayersIcon,
    value: (d) => d.sell.draft,
  },
  {
    key: "views",
    label: "Total views",
    href: "/dashboard/listings",
    icon: ChartIcon,
    value: (d) => d.sell.totalViews,
  },
  {
    key: "saved",
    label: "Saved cars",
    href: "/dashboard/saved",
    icon: SavedIcon,
    value: (d) => d.buy.savedCarsCount,
  },
  {
    key: "requests",
    label: "Buyer requests",
    href: "/dashboard/requests",
    icon: InboxIcon,
    value: (d) =>
      Array.isArray(d.sell.recentBuyerInquiries)
        ? d.sell.recentBuyerInquiries.length
        : 0,
  },
];

function OverviewCarPlaceholder() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[min(46%,30rem)] items-center justify-end lg:flex"
      aria-hidden
      style={{
        opacity: 0.28,
        maskImage: "linear-gradient(to right, transparent, #000 42%)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 42%)",
      }}
    >
      <svg
        viewBox="0 0 360 160"
        className="h-auto w-full text-[#E53E3E]"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M40 108h250" />
        <path d="M58 108l22-36h92l28 20h78c14 0 24 8 28 16v16" />
        <path d="M80 72l18-22h62l16 22" />
        <path d="M148 50v22M196 72h70" />
        <circle cx="108" cy="108" r="18" />
        <circle cx="108" cy="108" r="7" />
        <circle cx="262" cy="108" r="18" />
        <circle cx="262" cy="108" r="7" />
        <path d="M126 108h118" />
      </svg>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDashboard();
        if (active) setData(res);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login?next=/dashboard");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, router]);

  if (!user) return null;

  return (
    <section className="relative overflow-hidden">
      <style>{`
        @keyframes overview-arrow-nudge {
          from { transform: translateX(0); }
          to { transform: translateX(6px); }
        }
        .overview-arrow {
          animation: none;
        }
        .group:hover .overview-arrow {
          animation: overview-arrow-nudge 0.55s ease-in-out infinite alternate;
        }
      `}</style>
      <OverviewCarPlaceholder />

      <div className="relative">
        <h1 className="mt-0 max-w-2xl text-2xl font-light text-[var(--ink)] sm:text-3xl">
          Welcome, {user.fullName}
        </h1>
        <p className="section-copy mt-3 max-w-3xl">
          See how your cars are doing at a glance. Active listings, drafts, and total views
          show what you have on the market. Saved cars and buyer requests keep your buying
          and selling in one place. Open any block to go straight to that section.
        </p>

        {error ? <p className="form-error mt-6 max-w-xl">{error}</p> : null}

        {loading && !data ? (
          <PageLoader className="mt-8" label="Fetching your overview…" />
        ) : null}

        {data ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <li key={tile.key}>
                  <Link
                    href={tile.href}
                    className="group flex h-full flex-col rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--accent)] hover:shadow-md"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                      <p className="truncate text-sm font-light text-[#E53E3E]">
                        {tile.label}
                      </p>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p className="text-4xl font-semibold text-black sm:text-5xl">
                        {tile.value(data)}
                      </p>
                      <ArrowRightIcon className="overview-arrow mb-1 h-4 w-4 shrink-0 text-[#E53E3E]" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
