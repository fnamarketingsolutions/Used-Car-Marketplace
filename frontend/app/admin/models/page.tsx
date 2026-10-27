"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { LayersIcon, ShieldIcon, TagIcon } from "@/components/ui/NavIcons";
import { listAdminMakes, listAdminModels } from "@/lib/api/admin";
import {
  createModel,
  deleteModel,
  updateModel,
} from "@/lib/api/catalog";
import {
  ApiError,
  type CatalogMake,
  type CatalogModel,
} from "@/lib/api/types";
import listingImage from "../../../public/assets/adminDashboardImages/admin-listing.png";

function activeBadgeClass(isActive: boolean) {
  return isActive
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-red-100 text-red-800 border-red-200";
}

function makeIdOf(model: CatalogModel) {
  if (typeof model.make === "string") return model.make;
  return model.make?._id || "";
}

function makeNameOf(model: CatalogModel) {
  if (typeof model.make === "object" && model.make?.name) return model.make.name;
  return "—";
}

export default function AdminModelsPage() {
  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [filterMake, setFilterMake] = useState("");
  const [name, setName] = useState("");
  const [makeId, setMakeId] = useState("");
  const [edit, setEdit] = useState<CatalogModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [makesData, modelsData] = await Promise.all([
        listAdminMakes(),
        listAdminModels(filterMake || undefined),
      ]);
      setMakes(makesData.makes);
      setModels(modelsData.models);
      setMakeId((prev) => {
        if (prev) return prev;
        return makesData.makes.find((m) => m.isActive !== false)?._id || "";
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load models");
    } finally {
      setLoading(false);
    }
  }, [filterMake]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !makeId) return;
    setPending(true);
    setError(null);
    try {
      if (edit) {
        await updateModel(edit._id, { name: name.trim(), make: makeId });
      } else {
        await createModel({ name: name.trim(), make: makeId });
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

  async function toggleActive(model: CatalogModel) {
    setPending(true);
    setError(null);
    try {
      await updateModel(model._id, { isActive: !model.isActive });
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
      await deleteModel(deactivateId);
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
        title="Model management"
        description="Create and manage vehicle models under each make—keep variants organized so listings stay consistent and shoppers can filter with confidence."
        onRefresh={load}
        refreshing={loading}
        titleIcon={<LayersIcon className="h-6 w-6" />}
        image={{
          src: listingImage.src,
          width: listingImage.width,
          height: listingImage.height,
        }}
      />

      <div className="mb-4">
        <select
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm"
        >
          <option value="">All makes</option>
          {makes.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={onSubmit}
        className="mb-6 grid gap-3 rounded border border-[var(--line)] bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
      >
        <div className="field">
          <label htmlFor="model-make">Make</label>
          <select
            id="model-make"
            value={makeId}
            onChange={(e) => setMakeId(e.target.value)}
            required
          >
            <option value="">Select make</option>
            {makes
              .filter((m) => m.isActive !== false)
              .map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="model-name">{edit ? "Edit model" : "New model"}</label>
          <input
            id="model-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Swift"
          />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary text-sm" disabled={pending}>
            {edit ? "Update" : "Add model"}
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

      <div className="overflow-x-auto rounded border border-[var(--line)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2.5">Model</th>
              <th className="px-3 py-2.5">Make</th>
              <th className="px-3 py-2.5">Active</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr
                key={model._id}
                className="border-b border-[var(--line)] last:border-0"
              >
                <td className="px-3 py-3 font-medium">
                  <span className="inline-flex max-w-full items-center gap-2 text-[var(--ink)]">
                    <LayersIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{model.name}</span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--muted)]">
                  <span className="inline-flex max-w-full items-center gap-2">
                    <TagIcon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{makeNameOf(model)}</span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${activeBadgeClass(model.isActive !== false)}`}
                  >
                    <ShieldIcon className="h-3.5 w-3.5 shrink-0" />
                    {model.isActive === false ? "No" : "Yes"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-[var(--surface)]"
                      onClick={() => {
                        setEdit(model);
                        setName(model.name);
                        setMakeId(makeIdOf(model));
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:bg-[var(--surface)]"
                      onClick={() => toggleActive(model)}
                    >
                      {model.isActive === false ? "Activate" : "Deactivate"}
                    </button>
                    {model.isActive !== false ? (
                      <button
                        type="button"
                        className="rounded border border-[#9b1c1c]/40 px-2 py-1 text-xs text-[#9b1c1c] hover:bg-red-50"
                        onClick={() => setDeactivateId(model._id)}
                      >
                        Soft delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && models.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-8 text-center text-[var(--muted)]"
                >
                  No models yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(deactivateId)}
        title="Deactivate model"
        message="This will deactivate the model."
        danger
        pending={pending}
        onCancel={() => setDeactivateId(null)}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
}
