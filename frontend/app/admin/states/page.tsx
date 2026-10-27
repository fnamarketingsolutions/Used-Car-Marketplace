"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { MapIcon, ShieldIcon, TagIcon } from "@/components/ui/NavIcons";
import {
  createAdminState,
  deleteAdminState,
  listAdminStates,
  listStateRequests,
  reviewStateRequest,
  updateAdminState,
  type AdminGeoRequest,
  type AdminState,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";
import stateImage from "../../../public/assets/adminDashboardImages/admin-state.png";

function activeBadgeClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-red-100 text-red-800 border-red-200";
}

export default function AdminStatesPage() {
  const [states, setStates] = useState<AdminState[]>([]);
  const [requests, setRequests] = useState<AdminGeoRequest[]>([]);
  const [name, setName] = useState("");
  const [edit, setEdit] = useState<AdminState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statesData, requestsData] = await Promise.all([
        listAdminStates(),
        listStateRequests("pending"),
      ]);
      setStates(statesData.states);
      setRequests(requestsData.requests || []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load states");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    setError(null);
    try {
      if (edit) {
        await updateAdminState(edit._id, { name: name.trim() });
      } else {
        await createAdminState({ name: name.trim() });
      }
      setName("");
      setEdit(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  async function confirmDeactivate() {
    if (!deactivateId) return;
    setPending(true);
    try {
      await deleteAdminState(deactivateId);
      setDeactivateId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Deactivate failed");
    } finally {
      setPending(false);
    }
  }

  async function handleRequest(id: string, status: "approved" | "rejected") {
    setPending(true);
    setError(null);
    try {
      await reviewStateRequest(id, { status });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Review failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="State management"
        description="Manage states that power location filters—create or rename regions, review pending state requests, and deactivate entries that should no longer appear in discovery."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<MapIcon className="h-6 w-6" />}
        image={{
          src: stateImage.src,
          width: stateImage.width,
          height: stateImage.height,
        }}
      />

      <form
        onSubmit={onSubmit}
        className="mb-6 flex flex-wrap items-end gap-2 rounded border border-[var(--line)] bg-white p-4"
      >
        <div className="field min-w-[14rem] flex-1">
          <label htmlFor="state-name">{edit ? "Edit state" : "New state"}</label>
          <input
            id="state-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary text-sm" disabled={pending}>
          {edit ? "Update" : "Add state"}
        </button>
        {edit ? (
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => {
              setEdit(null);
              setName("");
            }}
          >
            Cancel
          </button>
        ) : null}
      </form>

      {error ? <p className="form-error mb-4">{error}</p> : null}

      {requests.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider">
            Pending requests
          </h2>
          <ul className="space-y-2">
            {requests.map((req) => (
              <li
                key={req._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--line)] bg-white px-3 py-2 text-sm"
              >
                <span>
                  {req.stateName}{" "}
                  <span className="text-[var(--muted)]">
                    · {req.user?.fullName || req.user?.email || "User"}
                  </span>
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    className="rounded border border-[var(--line)] px-2 py-1 text-xs"
                    disabled={pending}
                    onClick={() => handleRequest(req._id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded border border-[#9b1c1c]/40 px-2 py-1 text-xs text-[#9b1c1c]"
                    disabled={pending}
                    onClick={() => handleRequest(req._id, "rejected")}
                  >
                    Reject
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="overflow-x-auto rounded border border-[var(--line)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Slug</th>
              <th className="px-3 py-2.5">Active</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.map((state) => (
              <tr
                key={state._id}
                className="border-b border-[var(--line)] last:border-0"
              >
                <td className="px-3 py-3 font-medium">
                  <span className="inline-flex max-w-full items-center gap-2 text-[var(--ink)]">
                    <MapIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{state.name}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--muted)]">
                  <span className="inline-flex max-w-full items-center gap-2">
                    <TagIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{state.slug}</span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${activeBadgeClass(state.isActive !== false)}`}
                  >
                    <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                    {state.isActive === false ? "No" : "Yes"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs"
                      onClick={() => {
                        setEdit(state);
                        setName(state.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs"
                      onClick={async () => {
                        setPending(true);
                        try {
                          await updateAdminState(state._id, {
                            isActive: state.isActive === false,
                          });
                          await load();
                        } catch (err) {
                          setError(
                            err instanceof ApiError
                              ? err.message
                              : "Update failed"
                          );
                        } finally {
                          setPending(false);
                        }
                      }}
                    >
                      {state.isActive === false ? "Activate" : "Deactivate"}
                    </button>
                    {state.isActive !== false ? (
                      <button
                        type="button"
                        className="rounded border border-[#9b1c1c]/40 px-2 py-1 text-xs text-[#9b1c1c]"
                        onClick={() => setDeactivateId(state._id)}
                      >
                        Soft delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && states.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  No states yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(deactivateId)}
        title="Deactivate state"
        message="This will deactivate the state."
        danger
        pending={pending}
        onCancel={() => setDeactivateId(null)}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
