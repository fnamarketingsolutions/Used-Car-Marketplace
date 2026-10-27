"use client";

import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import PageLoader from "@/components/ui/PageLoader";
import {
  ArrowRightIcon,
  InboxIcon,
  ListingIcon,
  ShieldIcon,
  UsersIcon,
} from "@/components/ui/NavIcons";
import {
  blockAdminUser,
  getAdminUser,
  listAdminUsers,
  suspendAdminUser,
  unblockAdminUser,
  unsuspendAdminUser,
  type AdminListing,
} from "@/lib/api/admin";
import { ApiError, type AccountStatus, type AuthUser } from "@/lib/api/types";
import usersImage from "../../../public/assets/adminDashboardImages/admin-users.png";

type ActionKind = "suspend" | "unsuspend" | "block" | "unblock";
type PanelView = "overview" | "listings" | "listingDetail";

const STATUS_FILTERS: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "blocked", label: "Blocked" },
];

type UserDetail = {
  user: AuthUser;
  listingStats: Record<string, number>;
  listings: AdminListing[];
};

type AdminListingWithBody = AdminListing & { bodyType?: string };

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-4 w-4 shrink-0"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-4 w-4 shrink-0"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

function listingStatusBadgeClass(status?: string) {
  switch (status) {
    case "Live":
      return "bg-[var(--accent)] text-white";
    case "Paused":
      return "bg-[var(--muted)] text-white";
    case "Removed":
      return "bg-[#9b1c1c] text-white";
    case "Sold":
      return "bg-[color-mix(in_oklab,var(--accent)_20%,white)] text-[var(--accent-strong)]";
    default:
      return "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)]";
  }
}

function accountStatusBadgeClass(status: AccountStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "suspended":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "blocked":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-[var(--surface)] text-[var(--ink)] border-[var(--line)]";
  }
}

function accountStatusLabel(status: AccountStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "suspended":
      return "Suspended";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
}

function listingTitle(listing: AdminListingWithBody) {
  return (
    [listing.manufacturingYear, listing.variant || listing.bodyType]
      .filter(Boolean)
      .join(" ") || "Listing"
  );
}

function formatPrice(value?: number) {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [action, setAction] = useState<{
    kind: ActionKind;
    user: AuthUser;
  } | null>(null);
  const [note, setNote] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<PanelView>("overview");
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(
    null,
  );
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  function openUserPanel(userId: string) {
    setPanelView("overview");
    setSelectedListing(null);
    setSelectedUserId(userId);
  }

  function closeUserPanel() {
    setSelectedUserId(null);
    setSelectedListing(null);
    setPanelView("overview");
  }

  function openListingDetail(listing: AdminListing) {
    setSelectedListing(listing);
    setPanelView("listingDetail");
  }

  function toggleStatusFilter(value: AccountStatus) {
    setStatus((prev) => (prev === value ? "" : value));
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminUsers({
        status: status || undefined,
        q: q.trim() || undefined,
      });
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedUserId) {
      setDetail(null);
      setDetailError(null);
      setDetailLoading(false);
      setSelectedListing(null);
      setPanelView("overview");
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);

    void getAdminUser(selectedUserId)
      .then((data) => {
        if (!cancelled) {
          setDetail({
            user: data.user,
            listingStats: data.listingStats ?? {},
            listings: data.listings ?? [],
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailError(
            err instanceof ApiError ? err.message : "Failed to load user",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (panelView === "listingDetail") {
          setSelectedListing(null);
          setPanelView("listings");
        } else if (panelView === "listings") {
          setPanelView("overview");
        } else {
          closeUserPanel();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedUserId, panelView]);

  async function runAction() {
    if (!action) return;
    setPending(true);
    setError(null);
    try {
      const id = action.user.id;
      if (action.kind === "suspend") {
        await suspendAdminUser(id, note.trim() || undefined);
      } else if (action.kind === "unsuspend") {
        await unsuspendAdminUser(id);
      } else if (action.kind === "block") {
        await blockAdminUser(id, note.trim() || undefined);
      } else {
        await unblockAdminUser(id);
      }
      setAction(null);
      setNote("");
      await load();
      if (selectedUserId === id) {
        const data = await getAdminUser(id);
        setDetail({
          user: data.user,
          listingStats: data.listingStats ?? {},
          listings: data.listings ?? [],
        });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setPending(false);
    }
  }

  const stats = detail?.listingStats;
  const statItems = [
    { label: "Total", value: stats?.total ?? 0 },
    { label: "Live", value: stats?.live ?? 0 },
    { label: "Paused", value: stats?.paused ?? 0 },
    { label: "Sold", value: stats?.sold ?? 0 },
    { label: "Removed", value: stats?.removed ?? 0 },
  ];

  return (
    <div>
      <AdminPageHeader
        title="User management"
        description="Review marketplace accounts in one place—search sellers, suspend or block abusive activity, and restore access when issues are resolved. Open any user to inspect their profile and listing activity from the side panel."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<UsersIcon className="h-6 w-6" />}
        image={{
          src: usersImage.src,
          width: usersImage.width,
          height: usersImage.height,
        }}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone"
            className="w-80 max-w-full rounded border border-[var(--line)] bg-white px-3 py-2 text-sm sm:w-[28rem] md:w-[32rem] lg:w-[36rem]"
          />
          <button type="button" className="btn-primary shrink-0 text-sm" onClick={load}>
            Search
          </button>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {STATUS_FILTERS.map((filter) => {
            const selected = status === filter.value;
            const colorClass =
              filter.value === "active"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : filter.value === "suspended"
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-red-600 bg-red-600 text-white";
            return (
              <button
                key={filter.value}
                type="button"
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${colorClass} ${
                  selected
                    ? "ring-2 ring-offset-1 ring-[var(--ink)]/30"
                    : "opacity-85 hover:opacity-100"
                }`}
                onClick={() => toggleStatusFilter(filter.value)}
                aria-pressed={selected}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="form-error mb-4">{error}</p> : null}

      <div className="overflow-x-auto rounded border border-[var(--line)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="cursor-pointer border-b border-[var(--line)] transition-colors last:border-0 hover:bg-[var(--surface)]"
                onClick={() => openUserPanel(user.id)}
              >
                <td className="px-3 py-3 font-medium">
                  <span className="inline-flex max-w-full items-center gap-2 text-[var(--ink)]">
                    <UsersIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{user.fullName}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--muted)]">
                  <span className="inline-flex max-w-full items-center gap-2">
                    <InboxIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{user.email}</span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${accountStatusBadgeClass(user.accountStatus)}`}
                  >
                    <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                    {accountStatusLabel(user.accountStatus)}
                  </span>
                </td>
                <td
                  className="px-3 py-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap gap-1">
                    {user.accountStatus === "blocked" ? (
                      <button
                        type="button"
                        className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-white"
                        onClick={() => setAction({ kind: "unblock", user })}
                      >
                        Unblock
                      </button>
                    ) : (
                      <>
                        {user.accountStatus === "suspended" ? (
                          <button
                            type="button"
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-white"
                            onClick={() =>
                              setAction({ kind: "unsuspend", user })
                            }
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-white"
                            onClick={() => {
                              setNote("");
                              setAction({ kind: "suspend", user });
                            }}
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded border border-[#9b1c1c]/40 px-2 py-1 text-xs text-[#9b1c1c] hover:bg-red-50"
                          onClick={() => {
                            setNote("");
                            setAction({ kind: "block", user });
                          }}
                        >
                          Block
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  No users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selectedUserId ? (
        <div
          className="fixed inset-0 z-[70] flex justify-end bg-black/45"
          role="presentation"
          onClick={closeUserPanel}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-detail-title"
            className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
              <div className="min-w-0">
                {panelView === "listings" || panelView === "listingDetail" ? (
                  <button
                    type="button"
                    className="mb-1 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
                    onClick={() => {
                      if (panelView === "listingDetail") {
                        setSelectedListing(null);
                        setPanelView("listings");
                      } else {
                        setPanelView("overview");
                      }
                    }}
                  >
                    ← Back
                  </button>
                ) : null}
                <h2
                  id="admin-user-detail-title"
                  className="text-lg font-bold text-[var(--ink)]"
                >
                  {panelView === "listingDetail"
                    ? listingTitle(
                        (selectedListing || {}) as AdminListingWithBody,
                      )
                    : panelView === "listings"
                      ? "Listings"
                      : detail?.user.fullName || "User details"}
                </h2>
                <p className="mt-0.5 text-sm text-[var(--muted)]">
                  {panelView === "listingDetail"
                    ? "Listing details"
                    : panelView === "listings"
                      ? detail?.user.fullName
                        ? `${detail.user.fullName}'s inventory`
                        : "User inventory"
                      : "Account and listing activity"}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost shrink-0 px-2 py-1 text-sm"
                onClick={closeUserPanel}
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {detailLoading ? <PageLoader label="Loading user…" /> : null}
              {detailError ? (
                <p className="form-error">{detailError}</p>
              ) : null}
              {detail && !detailLoading && panelView === "overview" ? (
                <div className="space-y-6">
                  <section className="grid grid-cols-2 gap-3">
                    {(
                      [
                        {
                          key: "email",
                          label: "Email",
                          value: detail.user.email,
                          Icon: InboxIcon,
                        },
                        detail.user.phoneNumber
                          ? {
                              key: "phone",
                              label: "Phone",
                              value: detail.user.phoneNumber,
                              Icon: PhoneIcon,
                            }
                          : null,
                        {
                          key: "status",
                          label: "Status",
                          value: accountStatusLabel(detail.user.accountStatus),
                          Icon: ShieldIcon,
                        },
                        {
                          key: "joined",
                          label: "Joined",
                          value: formatDate(detail.user.createdAt),
                          Icon: CalendarIcon,
                        },
                      ] as Array<{
                        key: string;
                        label: string;
                        value: string;
                        Icon: typeof InboxIcon;
                      } | null>
                    )
                      .filter(Boolean)
                      .map((field) => {
                        if (!field) return null;
                        const { Icon } = field;
                        return (
                          <div
                            key={field.key}
                            className="flex min-w-0 items-start gap-2.5 rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
                          >
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--accent)]"
                              aria-hidden
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-[var(--muted)]">
                                {field.label}
                              </p>
                              <p
                                className={`mt-0.5 truncate text-sm font-medium text-[var(--ink)] ${
                                  field.key === "status" ? "capitalize" : ""
                                }`}
                              >
                                {field.value}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </section>

                  <button
                    type="button"
                    className="w-full rounded border border-[var(--line)] bg-[var(--surface)] p-3 text-left transition hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                    onClick={() => setPanelView("listings")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--accent)]"
                          aria-hidden
                        >
                          <ListingIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--ink)]">
                            Listings
                          </h3>
                          <p className="text-xs text-[var(--muted)]">
                            View tiles and status badges
                          </p>
                        </div>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {statItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded border border-[var(--line)] bg-white px-3 py-2"
                        >
                          <p className="text-xs text-[var(--muted)]">
                            {item.label}
                          </p>
                          <p className="mt-0.5 font-display text-xl font-bold tabular-nums">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </button>
                </div>
              ) : null}
              {detail && !detailLoading && panelView === "listings" ? (
                detail.listings.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    No listings for this user.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {detail.listings.map((listing) => (
                      <button
                        key={listing._id}
                        type="button"
                        className="relative w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 pt-5 text-left transition hover:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                        onClick={() => openListingDetail(listing)}
                      >
                        <span
                          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${listingStatusBadgeClass(listing.status)}`}
                        >
                          {listing.status || "Unknown"}
                        </span>
                        <p className="pr-16 text-sm font-semibold text-[var(--ink)]">
                          {listingTitle(listing as AdminListingWithBody)}
                        </p>
                        <p className="mt-2 text-sm font-medium text-[var(--accent)]">
                          {formatPrice(listing.askingPrice)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {listing.viewCount ?? 0} views
                        </p>
                      </button>
                    ))}
                  </div>
                )
              ) : null}
              {detail &&
              !detailLoading &&
              panelView === "listingDetail" &&
              selectedListing ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 pt-5">
                    <span
                      className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${listingStatusBadgeClass(selectedListing.status)}`}
                    >
                      {selectedListing.status || "Unknown"}
                    </span>
                    <p className="pr-16 text-base font-semibold text-[var(--ink)]">
                      {listingTitle(selectedListing as AdminListingWithBody)}
                    </p>
                  </div>
                  <section className="grid grid-cols-2 gap-3">
                    <div className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
                      <p className="text-xs text-[var(--muted)]">Status</p>
                      <p className="mt-0.5 text-sm font-medium text-[var(--ink)]">
                        {selectedListing.status || "—"}
                      </p>
                    </div>
                    <div className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
                      <p className="text-xs text-[var(--muted)]">Price</p>
                      <p className="mt-0.5 text-sm font-medium text-[var(--accent)]">
                        {formatPrice(selectedListing.askingPrice)}
                      </p>
                    </div>
                    <div className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
                      <p className="text-xs text-[var(--muted)]">Views</p>
                      <p className="mt-0.5 text-sm font-medium text-[var(--ink)]">
                        {selectedListing.viewCount ?? 0}
                      </p>
                    </div>
                    <div className="rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5">
                      <p className="text-xs text-[var(--muted)]">Year / variant</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-[var(--ink)]">
                        {listingTitle(selectedListing as AdminListingWithBody)}
                      </p>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}

      {action &&
      (action.kind === "suspend" || action.kind === "block") ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4"
          role="presentation"
          onClick={() => !pending && setAction(null)}
        >
          <div
            role="dialog"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold capitalize">{action.kind} user</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {action.user.fullName} ({action.user.email})
            </p>
            <div className="field mt-4">
              <label htmlFor="admin-note">Reason (optional)</label>
              <textarea
                id="admin-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn-ghost"
                disabled={pending}
                onClick={() => setAction(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={pending}
                onClick={runAction}
              >
                {pending ? "Please wait…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ConfirmModal
          open={Boolean(action)}
          title={
            action?.kind === "unsuspend"
              ? "Unsuspend user"
              : action?.kind === "unblock"
                ? "Unblock user"
                : "Confirm"
          }
          message={`Apply this action to ${action?.user.fullName || "user"}?`}
          pending={pending}
          onCancel={() => setAction(null)}
          onConfirm={runAction}
        />
      )}
    </div>
  );
}
