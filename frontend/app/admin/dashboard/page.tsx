"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import PageLoader from "@/components/ui/PageLoader";
import {
  ArrowRightIcon,
  ChartIcon,
  ListingIcon,
  MapIcon,
  PinIcon,
  RefreshIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/NavIcons";
import overviewImage from "../../../public/assets/adminDashboardImages/admin-overview-image.png";
import {
  getAdminDashboard,
  type AdminDashboardResponse,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";

type IconComponent = ComponentType<{ className?: string }>;

type MetricCard = {
  label: string;
  value: number;
  href?: string;
  Icon: IconComponent;
};

function MetricCardChrome({ card }: { card: MetricCard }) {
  const { Icon } = card;

  return (
    <div className="relative flex min-h-[7.5rem] flex-1 flex-col p-3 pb-8">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--accent)]"
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-wide text-[var(--accent)] sm:text-base">
            {card.label}
          </p>
          <p className="mt-1.5 font-display text-2xl font-bold tabular-nums text-[var(--ink)] sm:text-3xl">
            {card.value}
          </p>
        </div>
      </div>
      <span
        className="absolute bottom-2.5 right-2.5 text-[var(--accent)]"
        aria-hidden
      >
        <ArrowRightIcon className="animate-nudge-x h-5 w-5" />
      </span>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminDashboard());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const a = data?.analytics;

  const cards: MetricCard[] = a
    ? [
        {
          label: "Users",
          value: a.usersCount,
          href: "/admin/users",
          Icon: UsersIcon,
        },
        {
          label: "Pending reports",
          value: a.pendingReports,
          href: "/admin/moderation",
          Icon: ShieldIcon,
        },
        {
          label: "Pending city requests",
          value: a.pendingCityRequests,
          href: "/admin/cities",
          Icon: PinIcon,
        },
        {
          label: "Pending state requests",
          value: a.pendingStateRequests,
          href: "/admin/states",
          Icon: MapIcon,
        },
        {
          label: "Total listing views",
          value: a.totalViews,
          Icon: ChartIcon,
        },
      ]
    : [];

  const cardShell =
    "flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[#F4F6F5] shadow-md transition-shadow hover:shadow-lg";

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--accent)] transition-transform duration-150 hover:text-[var(--accent-strong)] active:scale-90 active:rotate-45 disabled:opacity-60"
          onClick={load}
          disabled={loading}
          aria-label={loading ? "Refreshing" : "Refresh"}
          title={loading ? "Refreshing…" : "Refresh"}
        >
          <RefreshIcon
            className={`h-5 w-5 shrink-0 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      {loading && !data ? (
        <PageLoader label="Loading…" />
      ) : a ? (
        <div className="space-y-6">
          <section className="flex items-center gap-4 border-b border-[var(--line)] pb-6 lg:gap-8">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--accent)]"
                aria-hidden
              >
                <ListingIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h2 className="section-title mt-0 text-[1.75rem] sm:text-[2rem]">
                  Built for used-car specialists
                </h2>
                <p className="section-copy mt-2 text-sm sm:text-base">
                  Used Car Marketplace is tuned for pre-owned inventory—trusted
                  listings, local discovery by city and state, and clear
                  moderation so buyers and sellers stay confident. This admin
                  view keeps users, reports, location requests, and listing
                  health in one place so you can run the marketplace with
                  precision.
                </p>
              </div>
            </div>
            <img
              src={overviewImage.src}
              alt=""
              width={overviewImage.width}
              height={overviewImage.height}
              className="hidden h-36 w-auto shrink-0 object-contain md:block lg:h-44"
              decoding="async"
            />
          </section>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {cards.map((card) =>
              card.href ? (
                <Link
                  key={card.label}
                  href={card.href}
                  className={`${cardShell} hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`}
                >
                  <MetricCardChrome card={card} />
                </Link>
              ) : (
                <div key={card.label} className={cardShell}>
                  <MetricCardChrome card={card} />
                </div>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
