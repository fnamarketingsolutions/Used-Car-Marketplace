"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import PageLoader from "@/components/ui/PageLoader";
import { ShieldIcon } from "@/components/ui/NavIcons";
import { listMyReports, type MyReport } from "@/lib/api/reports";
import { ApiError } from "@/lib/api/types";

function statusBadgeClass(status?: string) {
  switch (status) {
    case "actioned":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "dismissed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "reviewed":
      return "bg-[color-mix(in_oklab,var(--accent)_14%,white)] text-[var(--accent-strong)] border-[color-mix(in_oklab,var(--accent)_28%,white)]";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
}

function listingLabel(report: MyReport) {
  const listing = report.listing;
  if (!listing) return "Listing unavailable";
  const label = [
    listing.manufacturingYear,
    listing.make,
    listing.model,
    listing.variant,
  ]
    .filter(Boolean)
    .join(" ");
  return label || listing._id || "Listing";
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DashboardReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<MyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listMyReports();
        if (active) setReports(res.reports || []);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login?next=/dashboard/reports");
          return;
        }
        setError(
          err instanceof ApiError ? err.message : "Failed to load reports"
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div>
      <DashboardPageHeader
        icon={ShieldIcon}
        title="Reports"
        description="Reports you have submitted on listings. Track their review status here."
      />

      {error ? <p className="form-error mt-6 max-w-xl">{error}</p> : null}
      {loading ? (
        <PageLoader className="mt-8" label="Loading reports…" />
      ) : null}

      {!loading && !error && reports.length === 0 ? (
        <p className="mt-10 text-[var(--muted)]">
          You have not reported any listings yet. Open a listing and use Report
          if something looks wrong.
        </p>
      ) : null}

      {!loading && reports.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {reports.map((report) => (
            <li
              key={report._id}
              className="rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--ink)]">
                    {listingLabel(report)}
                  </p>
                  <p className="mt-1 text-sm capitalize text-[var(--muted)]">
                    {report.category || "other"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClass(report.status)}`}
                >
                  {report.status || "pending"}
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--ink)]">
                {report.reason || "—"}
              </p>
              <p className="mt-3 text-xs text-[var(--muted)]">
                Submitted {formatDate(report.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
