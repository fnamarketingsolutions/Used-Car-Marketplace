"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { AuthUser } from "@/lib/api/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type ProfileMenuProps = {
  user: AuthUser;
  align?: "left" | "right";
};

export default function ProfileMenu({ user, align = "right" }: ProfileMenuProps) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)]"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label="Open profile menu"
        onClick={() => setOpen((value) => !value)}
      >
        {initials(user.fullName)}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute z-50 mt-2 w-52 overflow-hidden rounded-lg bg-white p-2 shadow-sm ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="border-b border-[var(--line)] px-1 pb-2">
            <p className="truncate text-sm font-semibold text-[var(--ink)]">
              {user.fullName}
            </p>
            <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
              {user.email}
            </p>
          </div>

          <Link
            href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
            role="menuitem"
            className="mt-1 block px-2 py-1.5 text-sm text-[var(--ink)] transition hover:bg-[var(--surface)]"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <div className="mx-2 h-px bg-[var(--line)]" aria-hidden="true" />

          {user.role !== "admin" ? (
            <>
              <Link
                href="/dashboard/profile"
                role="menuitem"
                className="block px-2 py-1.5 text-sm text-[var(--ink)] transition hover:bg-[var(--surface)]"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
              <div className="mx-2 h-px bg-[var(--line)]" aria-hidden="true" />
            </>
          ) : null}

          <button
            type="button"
            role="menuitem"
            className="mx-auto mt-2 block w-[calc(100%-0.5rem)] rounded-md bg-[#E53E3E] px-2 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-[#c53030]"
            onClick={async () => {
              setOpen(false);
              await logout();
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
