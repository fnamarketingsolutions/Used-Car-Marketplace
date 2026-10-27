"use client";

import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PageLoader from "@/components/ui/PageLoader";
import { ChartIcon } from "@/components/ui/NavIcons";
import {
  getAdminAnalytics,
  type AdminAnalyticsResponse,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";
import overviewImage from "../../../public/assets/adminDashboardImages/admin-overview-image.png";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsResponse["analytics"] | null>(
    null
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminAnalytics({
        from: from || undefined,
        to: to || undefined,
      });
      setData(res.analytics);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Track platform health over a date range—users, listings, reports, and views—so you can spot trends and prioritize moderation or growth work."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<ChartIcon className="h-6 w-6" />}
        image={{
          src: overviewImage.src,
          width: overviewImage.width,
          height: overviewImage.height,
        }}
      />

      <div className="mb-6 flex flex-wrap items-end gap-2">
        <div className="field">
          <label htmlFor="from">From</label>
          <input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="to">To</label>
          <input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <button type="button" className="btn-primary text-sm" onClick={load}>
          Apply
        </button>
      </div>

      {error ? <p className="form-error mb-4">{error}</p> : null}

      {data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Total users", value: data.usersCount },
            { label: "New users (range)", value: data.newUsers },
            { label: "New listings (range)", value: data.newListings },
            { label: "Pending reports", value: data.pendingReports },
            { label: "Spam reports", value: data.spamReports },
            { label: "Fraud reports", value: data.fraudReports },
            { label: "Total views", value: data.totalViews },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded border border-[var(--line)] bg-white p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold">{card.value}</p>
            </div>
          ))}
          <div className="rounded border border-[var(--line)] bg-white p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Listings by status
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {Object.entries(data.listingsByStatus || {}).map(
                ([status, count]) => (
                  <li
                    key={status}
                    className="flex justify-between gap-2 text-sm"
                  >
                    <span>{status}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      ) : loading ? (
        <PageLoader label="Loading…" />
      ) : null}
    </div>
  );
}
