"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import PageLoader from "@/components/ui/PageLoader";
import {
  MapIcon,
  PinIcon,
  QueryIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/NavIcons";
import {
  listCityRequests,
  listStateRequests,
  reviewCityRequest,
  reviewStateRequest,
  type AdminGeoRequest,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";
import cityImage from "../../../public/assets/adminDashboardImages/admin-city.png";

type QueryRow = {
  key: string;
  kind: "city" | "state";
  id: string;
  userName: string;
  userEmail?: string;
  cityName: string;
  stateName: string;
  status: string;
  createdAt?: string;
  note?: string | null;
};

const STATUS_FILTERS = [
  {
    value: "",
    label: "All",
    colorClass: "border-[var(--ink)] bg-[var(--ink)] text-white",
  },
  {
    value: "pending",
    label: "Pending",
    colorClass: "border-amber-500 bg-amber-500 text-white",
  },
  {
    value: "approved",
    label: "Approved",
    colorClass: "border-emerald-600 bg-emerald-600 text-white",
  },
  {
    value: "rejected",
    label: "Rejected",
    colorClass: "border-red-600 bg-red-600 text-white",
  },
] as const;

function statusBadgeClass(status: string) {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (status === "rejected") {
    return "bg-red-100 text-red-800 border-red-200";
  }
  return "bg-amber-100 text-amber-800 border-amber-200";
}

export default function AdminQueryPage() {
  const [cityRequests, setCityRequests] = useState<AdminGeoRequest[]>([]);
  const [stateRequests, setStateRequests] = useState<AdminGeoRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = statusFilter || undefined;
      const [cities, states] = await Promise.all([
        listCityRequests(status),
        listStateRequests(status),
      ]);
      setCityRequests(cities.requests || []);
      setStateRequests(states.requests || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load queries");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    const cityRows: QueryRow[] = cityRequests.map((req) => ({
      key: `city-${req._id}`,
      kind: "city",
      id: req._id,
      userName: req.user?.fullName || "User",
      userEmail: req.user?.email,
      cityName: req.cityName || "—",
      stateName: req.state || req.stateName || "—",
      status: req.status || "pending",
      createdAt: req.createdAt,
      note: req.adminNote,
    }));

    // Standalone state requests only (linked ones are covered by city rows)
    const stateRows: QueryRow[] = stateRequests
      .filter((req) => !req.cityRequest)
      .map((req) => ({
        key: `state-${req._id}`,
        kind: "state",
        id: req._id,
        userName: req.user?.fullName || "User",
        userEmail: req.user?.email,
        cityName: "—",
        stateName: req.stateName || "—",
        status: req.status || "pending",
        createdAt: req.createdAt,
        note: req.adminNote,
      }));

    return [...cityRows, ...stateRows].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [cityRequests, stateRequests]);

  async function handleReview(
    row: QueryRow,
    status: "approved" | "rejected"
  ) {
    setPending(true);
    setError(null);
    try {
      if (row.kind === "city") {
        await reviewCityRequest(row.id, { status });
      } else {
        await reviewStateRequest(row.id, { status });
      }
      // Keep the updated request on this page with its new status (pending dot gone)
      if (statusFilter === "pending") {
        setStatusFilter("");
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Review failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Query"
        description="Review location requests from users who need new cities and states added—approve real demand and reject noise so discovery stays accurate across the marketplace."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<QueryIcon className="h-6 w-6" />}
        image={{
          src: cityImage.src,
          width: cityImage.width,
          height: cityImage.height,
        }}
      />

      <div className="mb-4 flex flex-wrap justify-end gap-1.5">
        {STATUS_FILTERS.map((filter) => {
          const selected = statusFilter === filter.value;
          return (
            <button
              key={filter.label}
              type="button"
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${filter.colorClass} ${
                selected
                  ? "ring-2 ring-offset-1 ring-[var(--ink)]/30"
                  : "opacity-85 hover:opacity-100"
              }`}
              onClick={() => setStatusFilter(filter.value)}
              aria-pressed={selected}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {error ? <p className="form-error mb-4 max-w-xl">{error}</p> : null}

      {loading ? (
        <PageLoader label="Loading queries…" />
      ) : rows.length === 0 ? (
        <p className="text-[var(--muted)]">No location requests found.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-[var(--line)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Requested</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="px-4 py-3">
                    <div className="inline-flex max-w-full items-start gap-2">
                      <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--ink)]">
                          {row.userName}
                        </p>
                        {row.userEmail ? (
                          <p className="text-xs text-[var(--muted)]">
                            {row.userEmail}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink)]">
                    <span className="inline-flex items-center gap-2">
                      <PinIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                      {row.cityName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink)]">
                    <span className="inline-flex items-center gap-2">
                      <MapIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                      {row.stateName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClass(
                        row.status
                      )}`}
                    >
                      {row.status === "pending" ? (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600"
                          aria-hidden
                        />
                      ) : (
                        <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                      )}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded border border-[var(--line)] px-2.5 py-1 text-xs font-medium text-[#15803d] hover:border-[#15803d]"
                          disabled={pending}
                          onClick={() => void handleReview(row, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="rounded border border-[var(--line)] px-2.5 py-1 text-xs font-medium text-[#b91c1c] hover:border-[#b91c1c]"
                          disabled={pending}
                          onClick={() => void handleReview(row, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
