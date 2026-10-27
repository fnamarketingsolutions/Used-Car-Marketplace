"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { ShieldIcon, TagIcon } from "@/components/ui/NavIcons";
import { listAdminMakes } from "@/lib/api/admin";
import {
  createMake,
  deleteMake,
  updateMake,
} from "@/lib/api/catalog";
import { ApiError, type CatalogMake } from "@/lib/api/types";
import listingImage from "../../../public/assets/adminDashboardImages/admin-listing.png";

function activeBadgeClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-red-100 text-red-800 border-red-200";
}

export default function AdminMakesPage() {
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [name, setName] = useState("");
  const [edit, setEdit] = useState<CatalogMake | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminMakes();
      setMakes(data.makes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load makes");
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
        await updateMake(edit._id, { name: name.trim() });
      } else {
        await createMake({ name: name.trim() });
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

  async function toggleActive(make: CatalogMake) {
    setPending(true);
    setError(null);
    try {
      await updateMake(make._id, { isActive: !make.isActive });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  async function confirmDeactivate() {
    if (!deactivateId) return;
    setPending(true);
    setError(null);
    try {
      await deleteMake(deactivateId);
      setDeactivateId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Deactivate failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Make management"
        description="Create and manage vehicle makes used in listings and filters—keep the catalog clean so sellers pick accurate brands and buyers find the right inventory."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<TagIcon className="h-6 w-6" />}
        image={{
          src: listingImage.src,
          width: listingImage.width,
          height: listingImage.height,
        }}
      />

      <form
        onSubmit={onSubmit}
        className="mb-6 flex flex-wrap items-end gap-2 rounded border border-[var(--line)] bg-white p-4"
      >
        <div className="field min-w-[14rem] flex-1">
          <label htmlFor="make-name">{edit ? "Edit make" : "New make"}</label>
          <input
            id="make-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Maruti Suzuki"
          />
        </div>
        <button type="submit" className="btn-primary text-sm" disabled={pending}>
          {edit ? "Update" : "Add make"}
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
            {makes.map((make) => (
              <tr
                key={make._id}
                className="border-b border-[var(--line)] last:border-0"
              >
                <td className="px-3 py-3 font-medium">
                  <span className="inline-flex max-w-full items-center gap-2 text-[var(--ink)]">
                    <TagIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{make.name}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--muted)]">
                  <span className="truncate">{make.slug}</span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${activeBadgeClass(make.isActive !== false)}`}
                  >
                    <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                    {make.isActive === false ? "No" : "Yes"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-[var(--surface)]"
                      onClick={() => {
                        setEdit(make);
                        setName(make.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-[var(--surface)]"
                      onClick={() => toggleActive(make)}
                    >
                      {make.isActive === false ? "Activate" : "Deactivate"}
                    </button>
                    {make.isActive !== false ? (
                      <button
                        type="button"
                        className="rounded border border-[#9b1c1c]/40 px-2 py-1 text-xs text-[#9b1c1c] hover:bg-red-50"
                        onClick={() => setDeactivateId(make._id)}
                      >
                        Soft delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && makes.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  No makes yet. Add one above.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(deactivateId)}
        title="Deactivate make"
        message="This will deactivate the make and its models."
        danger
        pending={pending}
        onCancel={() => setDeactivateId(null)}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
