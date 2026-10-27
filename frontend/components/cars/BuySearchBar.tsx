"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function BuySearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form onSubmit={onSearch} className="mt-8 flex flex-wrap gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search make, model, variant…"
        className="min-w-0 flex-1 rounded border border-[var(--line)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        aria-label="Search listings"
      />
      <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
        Search
      </button>
    </form>
  );
}
