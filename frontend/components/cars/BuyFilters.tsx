"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getMakes, getModels } from "@/lib/api/catalog";
import type { CatalogMake, CatalogModel } from "@/lib/api/types";

function buildQuery(
  current: URLSearchParams,
  updates: Record<string, string | undefined>
) {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
  }
  next.delete("page");
  const qs = next.toString();
  return qs ? `?${qs}` : "";
}

export default function BuyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [make, setMake] = useState(searchParams.get("make") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");

  const [makes, setMakes] = useState<CatalogMake[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setMake(searchParams.get("make") || "");
    setModel(searchParams.get("model") || "");
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingMakes(true);
      try {
        const data = await getMakes();
        if (active) setMakes(data.makes || []);
      } catch {
        if (active) setMakes([]);
      } finally {
        if (active) setLoadingMakes(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!make) {
      setModels([]);
      return;
    }
    let active = true;
    (async () => {
      setLoadingModels(true);
      try {
        const data = await getModels({ make });
        if (active) setModels(data.models || []);
      } catch {
        if (active) setModels([]);
      } finally {
        if (active) setLoadingModels(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [make]);

  function pushFilters(updates: Record<string, string | undefined>) {
    router.push(`${pathname}${buildQuery(searchParams, updates)}`);
  }

  function onApplyFilters(e: FormEvent) {
    e.preventDefault();
    pushFilters({
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
      make: make.trim(),
      model: model.trim(),
    });
  }

  function onClearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setMake("");
    setModel("");
    pushFilters({
      minPrice: "",
      maxPrice: "",
      make: "",
      model: "",
    });
  }

  return (
    <aside className="rounded border border-[var(--line)] bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
          Filters
        </h2>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-medium text-[var(--accent)] hover:underline"
        >
          Clear
        </button>
      </div>

      <form onSubmit={onApplyFilters} className="mt-4 space-y-4">
        <div className="field">
          <label htmlFor="buy-min-price">Min price</label>
          <input
            id="buy-min-price"
            type="number"
            min={0}
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="field">
          <label htmlFor="buy-max-price">Max price</label>
          <input
            id="buy-max-price"
            type="number"
            min={0}
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Any"
          />
        </div>
        <div className="field">
          <label htmlFor="buy-make">Make</label>
          <select
            id="buy-make"
            value={make}
            disabled={loadingMakes}
            onChange={(e) => {
              setMake(e.target.value);
              setModel("");
            }}
          >
            <option value="">All makes</option>
            {makes.map((item) => (
              <option key={item._id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="buy-model">Model</label>
          <select
            id="buy-model"
            value={model}
            disabled={!make || loadingModels}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="">
              {!make ? "Select a make first" : "All models"}
            </option>
            {models.map((item) => (
              <option key={item._id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary w-full text-sm">
          Apply filters
        </button>
      </form>
    </aside>
  );
}
