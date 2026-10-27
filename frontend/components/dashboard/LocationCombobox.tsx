"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type LocationOption = {
  id: string;
  label: string;
};

type LocationComboboxProps = {
  id?: string;
  label: string;
  valueId: string;
  valueLabel: string;
  options: LocationOption[];
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  emptyHint?: string;
  required?: boolean;
  onSelect: (option: LocationOption | null) => void;
};

export default function LocationCombobox({
  id: idProp,
  label,
  valueId,
  valueLabel,
  options,
  disabled = false,
  loading = false,
  placeholder = "Type to search…",
  emptyHint,
  required = false,
  onSelect,
}: LocationComboboxProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const listId = `${id}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(valueLabel);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(valueLabel);
  }, [valueLabel]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        if (valueId) setQuery(valueLabel);
        else if (!query.trim()) setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [valueId, valueLabel, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  const showNotFound =
    open && !loading && !disabled && query.trim().length > 0 && filtered.length === 0;

  return (
    <div className="field relative" ref={rootRef}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled || loading}
        required={required && !valueId}
        value={query}
        placeholder={loading ? "Loading…" : placeholder}
        className="border border-[var(--line)] bg-white text-[var(--ink)] rounded-[0.25rem] px-[0.85rem] py-[0.7rem] outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(47,111,237,0.15)] disabled:opacity-60"
        onFocus={() => {
          if (!disabled && !loading) setOpen(true);
        }}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          setOpen(true);
          if (valueId) onSelect(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            if (valueId) setQuery(valueLabel);
          }
        }}
      />
      {emptyHint && !open ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{emptyHint}</p>
      ) : null}

      {open && !disabled && !loading ? (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded border border-[var(--line)] bg-white shadow-lg"
        >
          {filtered.length > 0 ? (
            <ul className="py-1">
              {filtered.map((opt) => (
                <li key={opt.id} role="option" aria-selected={opt.id === valueId}>
                  <button
                    type="button"
                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-[color-mix(in_oklab,var(--accent)_10%,white)] ${
                      opt.id === valueId
                        ? "font-semibold text-[var(--accent)]"
                        : "text-[var(--ink)]"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onSelect(opt);
                      setQuery(opt.label);
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : showNotFound ? (
            <div className="px-3 py-3 text-sm text-[var(--muted)]">
              <p className="font-medium text-[var(--ink)]">Not found</p>
              <p className="mt-1">
                Can&apos;t find this location?{" "}
                <Link
                  href="/dashboard/requests"
                  className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
                  onClick={() => setOpen(false)}
                >
                  Request state or city
                </Link>
              </p>
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-[var(--muted)]">
              Start typing to search…
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
