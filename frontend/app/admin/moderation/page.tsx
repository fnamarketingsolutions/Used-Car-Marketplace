"use client";

import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  ListingIcon,
  ShieldIcon,
  TagIcon,
  UsersIcon,
} from "@/components/ui/NavIcons";
import {
  blockAdminUser,
  listAdminReports,
  removeAdminListing,
  reviewAdminReport,
  suspendAdminUser,
  warnAdminUser,
  type AdminReport,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";
import reportImage from "../../../public/assets/adminDashboardImages/admin-report.png";

const STATUS_FILTERS = [
  {
    value: "pending",
    label: "Pending",
    colorClass: "border-amber-500 bg-amber-500 text-white",
  },
  {
    value: "reviewed",
    label: "Reviewed",
    colorClass: "border-[var(--accent)] bg-[var(--accent)] text-white",
  },
  {
    value: "actioned",
    label: "Actioned",
    colorClass: "border-emerald-600 bg-emerald-600 text-white",
  },
  {
    value: "dismissed",
    label: "Dismissed",
    colorClass: "border-slate-500 bg-slate-500 text-white",
  },
] as const;

function reportStatusBadgeClass(status?: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "reviewed":
      return "bg-[color-mix(in_oklab,var(--accent)_14%,white)] text-[var(--accent-strong)] border-[color-mix(in_oklab,var(--accent)_28%,white)]";
    case "actioned":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "dismissed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-[var(--surface)] text-[var(--ink)] border-[var(--line)]";
  }
}

function listingLabel(report: AdminReport) {
  const listing = report.listing;
  if (!listing) return "—";
  const label = [
    listing.manufacturingYear,
    listing.make,
    listing.model,
    listing.variant,
  ]
    .filter(Boolean)
    .join(" ");
  return label || listing._id || "—";
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [reviewStatus, setReviewStatus] = useState("actioned");
  const [adminNote, setAdminNote] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  function toggleStatusFilter(value: string) {
    setStatus((prev) => (prev === value ? "" : value));
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminReports({
        status: status || undefined,
      });
      setReports(data.reports);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markActioned(note?: string) {
    if (!selected) return;
    await reviewAdminReport(selected._id, {
      status: "actioned",
      adminNote: (note ?? adminNote).trim() || undefined,
    });
  }

  async function submitReview() {
    if (!selected) return;
    setPending(true);
    setError(null);
    setActionMessage(null);
    try {
      await reviewAdminReport(selected._id, {
        status: reviewStatus,
        adminNote: adminNote.trim() || undefined,
      });
      setSelected(null);
      setAdminNote("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Review failed");
    } finally {
      setPending(false);
    }
  }

  async function runEnforcement(
    kind: "remove" | "warn" | "suspend" | "block"
  ) {
    if (!selected) return;
    setPending(true);
    setError(null);
    setActionMessage(null);
    try {
      if (kind === "remove") {
        const listingId = selected.listing?._id;
        if (!listingId) {
          throw new Error("No listing linked to this report");
        }
        await removeAdminListing(listingId);
        const note =
          adminNote.trim() || "Listing removed after report review";
        setAdminNote(note);
        await markActioned(note);
        setActionMessage("Listing removed and report marked actioned.");
      } else {
        const userId = selected.reportedUser?._id;
        if (!userId) {
          throw new Error("No reported user linked to this report");
        }
        const note =
          adminNote.trim() ||
          `Action taken from report: ${selected.reason || selected.category || "abuse"}`;
        if (kind === "warn") {
          await warnAdminUser(userId, note);
          setActionMessage("User warned.");
        } else if (kind === "suspend") {
          await suspendAdminUser(userId, note);
          setActionMessage("User suspended.");
        } else {
          await blockAdminUser(userId, note);
          setActionMessage("User blocked.");
        }
        setAdminNote(note);
        await markActioned(note);
        setActionMessage((prev) =>
          prev ? `${prev} Report marked actioned.` : "Report marked actioned."
        );
      }
      setReviewStatus("actioned");
      await load();
      const refreshed = await listAdminReports({
        status: status || undefined,
      });
      const updated = refreshed.reports.find((r) => r._id === selected._id);
      if (updated) setSelected(updated);
      else setSelected(null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Action failed"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Triage reported listings—review reporter details, reasons, and take action so the marketplace stays safe for buyers and sellers."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<ShieldIcon className="h-6 w-6" />}
        image={{
          src: reportImage.src,
          width: reportImage.width,
          height: reportImage.height,
        }}
      />

      <div className="mb-4 flex flex-wrap justify-end gap-1.5">
        {STATUS_FILTERS.map((filter) => {
          const selectedFilter = status === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${filter.colorClass} ${
                selectedFilter
                  ? "ring-2 ring-offset-1 ring-[var(--ink)]/30"
                  : "opacity-85 hover:opacity-100"
              }`}
              onClick={() => toggleStatusFilter(filter.value)}
              aria-pressed={selectedFilter}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {error && !selected ? <p className="form-error mb-4">{error}</p> : null}

      <div className="overflow-x-auto rounded border border-[var(--line)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2.5">Target</th>
              <th className="px-3 py-2.5">Reporter</th>
              <th className="px-3 py-2.5">Category</th>
              <th className="px-3 py-2.5">Reason</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const TargetIcon =
                report.targetType === "listing" ? ListingIcon : UsersIcon;
              return (
                <tr
                  key={report._id}
                  className="border-b border-[var(--line)] last:border-0"
                >
                  <td className="px-3 py-3">
                    <div className="inline-flex max-w-full items-start gap-2">
                      <TargetIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                      <div className="min-w-0">
                        <div className="font-medium capitalize text-[var(--ink)]">
                          {report.targetType}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {report.targetType === "listing"
                            ? listingLabel(report)
                            : report.reportedUser?.fullName ||
                              report.reportedUser?.email ||
                              "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-[var(--muted)]">
                    <div className="font-medium text-[var(--ink)]">
                      {report.reporter?.fullName || "—"}
                    </div>
                    <div>{report.reporter?.email || ""}</div>
                  </td>
                  <td className="px-3 py-3 capitalize">
                    <span className="inline-flex items-center gap-2">
                      <TagIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                      {report.category}
                    </span>
                  </td>
                  <td className="max-w-xs px-3 py-3 text-[var(--muted)]">
                    {report.reason || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${reportStatusBadgeClass(report.status)}`}
                    >
                      <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                      {report.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-[var(--surface)]"
                      onClick={() => {
                        setSelected(report);
                        setReviewStatus(
                          report.status === "pending"
                            ? "actioned"
                            : report.status || "reviewed"
                        );
                        setAdminNote(report.adminNote || "");
                        setActionMessage(null);
                        setError(null);
                      }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && reports.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  No reports found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => !pending && setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-report-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="review-report-title" className="text-lg font-bold">
              Review report
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Reporter
                </dt>
                <dd className="mt-0.5 text-[var(--ink)]">
                  {selected.reporter?.fullName || "—"}
                  {selected.reporter?.email
                    ? ` · ${selected.reporter.email}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Reported listing
                </dt>
                <dd className="mt-0.5 text-[var(--ink)]">
                  {selected.targetType === "listing"
                    ? listingLabel(selected)
                    : "—"}
                  {selected.listing?.status
                    ? ` (${selected.listing.status})`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Reported seller
                </dt>
                <dd className="mt-0.5 text-[var(--ink)]">
                  {selected.reportedUser?.fullName || "—"}
                  {selected.reportedUser?.email
                    ? ` · ${selected.reportedUser.email}`
                    : ""}
                  {selected.reportedUser?.accountStatus
                    ? ` · ${selected.reportedUser.accountStatus}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Category
                </dt>
                <dd className="mt-0.5 capitalize text-[var(--ink)]">
                  {selected.category || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Reason
                </dt>
                <dd className="mt-0.5 text-[var(--ink)]">
                  {selected.reason || "No reason provided."}
                </dd>
              </div>
              {selected.details ? (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                    Details
                  </dt>
                  <dd className="mt-0.5 text-[var(--ink)]">{selected.details}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Submitted
                </dt>
                <dd className="mt-0.5 text-[var(--ink)]">
                  {formatDate(selected.createdAt)}
                </dd>
              </div>
            </dl>

            <div className="field mt-4">
              <label htmlFor="review-status">Status</label>
              <select
                id="review-status"
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
              >
                <option value="reviewed">Reviewed</option>
                <option value="actioned">Actioned</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div className="field mt-3">
              <label htmlFor="admin-note">Admin note</label>
              <textarea
                id="admin-note"
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Optional note for the action taken…"
              />
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Take action
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.listing?._id ? (
                  <button
                    type="button"
                    className="rounded border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-60"
                    disabled={pending}
                    onClick={() => void runEnforcement("remove")}
                  >
                    Remove listing
                  </button>
                ) : null}
                {selected.reportedUser?._id ? (
                  <>
                    <button
                      type="button"
                      className="rounded border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 disabled:opacity-60"
                      disabled={pending}
                      onClick={() => void runEnforcement("warn")}
                    >
                      Warn user
                    </button>
                    <button
                      type="button"
                      className="rounded border border-orange-300 bg-orange-50 px-2.5 py-1.5 text-xs font-medium text-orange-900 hover:bg-orange-100 disabled:opacity-60"
                      disabled={pending}
                      onClick={() => void runEnforcement("suspend")}
                    >
                      Suspend user
                    </button>
                    <button
                      type="button"
                      className="rounded border border-red-300 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-60"
                      disabled={pending}
                      onClick={() => void runEnforcement("block")}
                    >
                      Block user
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            {error ? <p className="form-error mt-3">{error}</p> : null}
            {actionMessage ? (
              <p className="form-success mt-3">{actionMessage}</p>
            ) : null}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn-ghost"
                disabled={pending}
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={pending}
                onClick={() => void submitReview()}
              >
                {pending ? "Saving…" : "Save status"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
