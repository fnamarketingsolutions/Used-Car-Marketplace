"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getStates, listMyCityRequests } from "@/lib/api/locations";
import {
  ApiError,
  type LocationRequest,
  type LocationState,
} from "@/lib/api/types";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import LocationRequestModal from "@/components/dashboard/LocationRequestModal";
import PageLoader from "@/components/ui/PageLoader";
import {
  CalendarIcon,
  InboxIcon,
  MapIcon,
  NoteIcon,
  PinIcon,
  ShieldIcon,
} from "@/components/ui/NavIcons";

type RequestFilter = "all" | "approved" | "pending" | "dismiss";

const FILTERS: { id: RequestFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "approved", label: "Approved" },
  { id: "pending", label: "Pending" },
  { id: "dismiss", label: "Dismiss" },
];

function chipClass(id: RequestFilter, active: boolean) {
  const ring = active ? " ring-1 ring-[var(--ink)] ring-offset-2" : "";
  if (id === "approved") return `bg-[#15803d] text-white${ring}`;
  if (id === "pending") return `bg-[#ea580c] text-white${ring}`;
  if (id === "dismiss") return `bg-[#dc2626] text-white${ring}`;
  return `bg-[#64748b] text-white${ring}`;
}

function statusBadgeClass(status: string) {
  if (status === "approved") {
    return "bg-[color-mix(in_oklab,#16a34a_14%,white)] text-[#15803d]";
  }
  if (status === "rejected") {
    return "bg-[color-mix(in_oklab,#dc2626_12%,white)] text-[#b91c1c]";
  }
  return "bg-[color-mix(in_oklab,#d97706_16%,white)] text-[#b45309]";
}

function statusLabel(status: string) {
  if (status === "rejected") return "Rejected";
  if (status === "approved") return "Approved";
  if (status === "pending") return "Pending";
  return status;
}

function matchesFilter(status: string, filter: RequestFilter) {
  if (filter === "all") return true;
  if (filter === "dismiss") return status === "rejected";
  return status === filter;
}

export default function RequestsPage() {
  const router = useRouter();
  const [locationRequests, setLocationRequests] = useState<LocationRequest[]>(
    []
  );
  const [states, setStates] = useState<LocationState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RequestFilter>("all");
  const [fieldDetail, setFieldDetail] = useState<{
    title: string;
    text: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestsRes, statesRes] = await Promise.all([
        listMyCityRequests(),
        getStates(),
      ]);
      setLocationRequests(requestsRes.requests || []);
      setStates(statesRes.states || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login?next=/dashboard/requests");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function refreshLocationRequests() {
    try {
      const refreshed = await listMyCityRequests();
      setLocationRequests(refreshed.requests || []);
    } catch {
      // list already shown; toast covers submit success
    }
  }

  const visibleRequests = useMemo(
    () =>
      locationRequests.filter((req) => matchesFilter(req.status, statusFilter)),
    [locationRequests, statusFilter]
  );

  return (
    <div>
      <DashboardPageHeader
        icon={InboxIcon}
        iconBesideTitle
        title="Requests"
        description="Request a missing city or state so you can use it in listings. Choose a state first, then the city, and add a short reason. Track each request here as pending, approved, or rejected."
      />

      {error ? <p className="form-error mt-6 max-w-xl">{error}</p> : null}
      {loading ? (
        <PageLoader className="mt-8" label="Loading requests…" />
      ) : null}

      {!loading ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--ink)]">
                Location requests
              </h2>
              <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
                Ask admin to add a city (and optionally a new state) so you can
                use it in listings.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <button
                type="button"
                className="btn-primary shrink-0"
                onClick={() => setRequestModalOpen(true)}
              >
                Create request
              </button>
              <div className="flex flex-wrap justify-end gap-1.5">
                {FILTERS.map((filter) => {
                  const active = statusFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setStatusFilter(filter.id)}
                      className={`min-h-0 rounded-full px-3 py-1 text-[11px] font-semibold text-white transition ${chipClass(
                        filter.id,
                        active
                      )}`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {locationRequests.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              You have not requested any cities yet.
            </p>
          ) : visibleRequests.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted)]">
              No requests match this status.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[color-mix(in_oklab,#E53E3E_16%,white)] text-xs uppercase tracking-wide text-black">
                    <th className="px-4 py-3 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <PinIcon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                        City
                      </span>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <MapIcon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                        State
                      </span>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <NoteIcon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                        Reason
                      </span>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                        Date
                      </span>
                    </th>
                    <th className="px-4 py-3 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        <ShieldIcon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                        Status
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.map((req) => (
                    <tr
                      key={req._id}
                      className="border-b border-[var(--line)] last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--ink)]">
                        <div className="flex items-start gap-2">
                          <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#E53E3E]" />
                          <div className="min-w-0">
                            <button
                              type="button"
                              className="block max-w-[10rem] truncate text-left"
                              onClick={() =>
                                setFieldDetail({
                                  title: "City",
                                  text: req.cityName || "—",
                                })
                              }
                            >
                              {req.cityName}
                            </button>
                            {req.isNewState ? (
                              <span className="mt-0.5 block text-xs font-normal text-[var(--muted)]">
                                Includes new state
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--ink)]">
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <MapIcon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                          <button
                            type="button"
                            className="block max-w-[8rem] truncate text-left"
                            onClick={() =>
                              setFieldDetail({
                                title: "State",
                                text: req.state || "—",
                              })
                            }
                          >
                            {req.state || "—"}
                          </button>
                        </span>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-[var(--ink)]">
                        <div className="flex items-start gap-2">
                          <NoteIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#E53E3E]" />
                          <div className="min-w-0">
                            <button
                              type="button"
                              className="block max-w-[12rem] truncate text-left"
                              onClick={() =>
                                setFieldDetail({
                                  title: "Reason",
                                  text: req.reason || "—",
                                })
                              }
                            >
                              {req.reason || "—"}
                            </button>
                            {req.adminNote ? (
                              <p className="mt-1 max-w-[12rem] truncate text-xs text-[var(--muted)]">
                                Note: {req.adminNote}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                        <span className="inline-flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                          {req.createdAt
                            ? new Date(req.createdAt).toLocaleString()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <ShieldIcon className="h-4 w-4 shrink-0 text-[#E53E3E]" />
                          <span
                            className={`inline-flex rounded-full px-1.5 py-px text-[9px] font-semibold uppercase ${statusBadgeClass(
                              req.status
                            )}`}
                          >
                            {statusLabel(req.status)}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {fieldDetail ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => setFieldDetail(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-field-title"
            className="relative w-full max-w-xs rounded-xl bg-white p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded text-[var(--ink)] transition hover:bg-[var(--surface)]"
              onClick={() => setFieldDetail(null)}
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <h2
              id="request-field-title"
              className="pr-8 text-base font-bold text-[var(--ink)]"
            >
              {fieldDetail.title}
            </h2>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--ink)]">
              {fieldDetail.text}
            </p>
          </div>
        </div>
      ) : null}

      <LocationRequestModal
        open={requestModalOpen}
        states={states}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => {
          toast.success("Location request submitted");
          void refreshLocationRequests();
        }}
      />
    </div>
  );
}
