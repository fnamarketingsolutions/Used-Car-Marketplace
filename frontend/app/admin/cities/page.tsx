"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { MapIcon, PinIcon, ShieldIcon } from "@/components/ui/NavIcons";
import {
  createAdminCity,
  deleteAdminCity,
  listAdminCities,
  listAdminStates,
  listCityRequests,
  reviewCityRequest,
  updateAdminCity,
  type AdminCity,
  type AdminGeoRequest,
  type AdminState,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/types";
import cityImage from "../../../public/assets/adminDashboardImages/admin-city.png";

function activeBadgeClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-red-100 text-red-800 border-red-200";
}

function stateIdOf(city: AdminCity) {
  if (typeof city.stateId === "string") return city.stateId;
  return city.stateId?._id || "";
}

export default function AdminCitiesPage() {
  const [states, setStates] = useState<AdminState[]>([]);
  const [cities, setCities] = useState<AdminCity[]>([]);
  const [requests, setRequests] = useState<AdminGeoRequest[]>([]);
  const [filterState, setFilterState] = useState("");
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [edit, setEdit] = useState<AdminCity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statesData, citiesData, requestsData] = await Promise.all([
        listAdminStates(),
        listAdminCities(filterState || undefined),
        listCityRequests("pending"),
      ]);
      setStates(statesData.states);
      setCities(citiesData.cities);
      setRequests(requestsData.requests || []);
      setStateId((prev) => prev || statesData.states.find((s) => s.isActive !== false)?._id || "");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load cities");
    } finally {
      setLoading(false);
    }
  }, [filterState]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !stateId) return;
    setPending(true);
    setError(null);
    try {
      if (edit) {
        await updateAdminCity(edit._id, { name: name.trim(), stateId });
      } else {
        await createAdminCity({ name: name.trim(), stateId });
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
      await deleteAdminCity(deactivateId);
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
      await reviewCityRequest(id, { status });
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
        title="City management"
        description="Maintain cities used for local discovery—add or edit locations by state, review pending city requests, and keep inactive entries out of marketplace filters."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<PinIcon className="h-6 w-6" />}
        image={{
          src: cityImage.src,
          width: cityImage.width,
          height: cityImage.height,
        }}
      />

      <div className="mb-4">
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm"
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={onSubmit}
        className="mb-6 grid gap-3 rounded border border-[var(--line)] bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
      >
        <div className="field">
          <label htmlFor="city-state">State</label>
          <select
            id="city-state"
            value={stateId}
            onChange={(e) => setStateId(e.target.value)}
            required
          >
            <option value="">Select state</option>
            {states
              .filter((s) => s.isActive !== false)
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="city-name">{edit ? "Edit city" : "New city"}</label>
          <input
            id="city-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary text-sm" disabled={pending}>
            {edit ? "Update" : "Add city"}
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
        </div>
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
                  {req.cityName}
                  {req.stateName ? ` · ${req.stateName}` : ""}{" "}
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
              <th className="px-3 py-2.5">City</th>
              <th className="px-3 py-2.5">State</th>
              <th className="px-3 py-2.5">Active</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr
                key={city._id}
                className="border-b border-[var(--line)] last:border-0"
              >
                <td className="px-3 py-3 font-medium">
                  <span className="inline-flex max-w-full items-center gap-2 text-[var(--ink)]">
                    <PinIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{city.name}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--muted)]">
                  <span className="inline-flex max-w-full items-center gap-2">
                    <MapIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">
                      {city.state ||
                        (typeof city.stateId === "object"
                          ? city.stateId?.name
                          : "—")}
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${activeBadgeClass(city.isActive !== false)}`}
                  >
                    <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                    {city.isActive === false ? "No" : "Yes"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs"
                      onClick={() => {
                        setEdit(city);
                        setName(city.name);
                        setStateId(stateIdOf(city));
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
                          await updateAdminCity(city._id, {
                            isActive: city.isActive === false,
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
                      {city.isActive === false ? "Activate" : "Deactivate"}
                    </button>
                    {city.isActive !== false ? (
                      <button
                        type="button"
                        className="rounded border border-[#9b1c1c]/40 px-2 py-1 text-xs text-[#9b1c1c]"
                        onClick={() => setDeactivateId(city._id)}
                      >
                        Soft delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && cities.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  No cities yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(deactivateId)}
        title="Deactivate city"
        message="This will deactivate the city."
        danger
        pending={pending}
        onCancel={() => setDeactivateId(null)}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
