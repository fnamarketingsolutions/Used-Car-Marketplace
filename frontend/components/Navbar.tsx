"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import ProfileMenu from "@/components/dashboard/ProfileMenu";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Top red info bar */}
      <div className="bg-[var(--accent)] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6 sm:text-sm">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon />
              <span className="hidden sm:inline">Monday–Saturday 7:00AM – 6:00PM</span>
              <span className="sm:hidden">Mon–Sat 7AM–6PM</span>
            </span>
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <PinIcon />
              1105 Roosevelt Street, CA
            </span>
          </div>
          <a
            href="tel:0951856558"
            className="inline-flex items-center gap-2 rounded-sm bg-white px-3 py-1.5 font-semibold text-[var(--accent)] shadow-sm"
          >
            <PhoneIcon />
            095 1856 558
          </a>
        </div>
      </div>

      {/* Lower white nav with overlapping logo */}
      <div className="relative border-b border-[var(--line)] bg-white">
        <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-end gap-4 px-4 sm:h-[4.25rem] sm:px-6 md:justify-center">
          {/* Logo block — overlaps top + lower bars */}
          <Link
            href="/"
            className="absolute left-4 top-0 z-10 flex h-[4.75rem] w-[4.75rem] -translate-y-[1.65rem] flex-col items-center justify-center bg-white shadow-md sm:left-6 sm:h-[5.5rem] sm:w-[5.5rem] sm:-translate-y-[1.9rem]"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-7 w-7 items-center justify-center sm:h-8 sm:w-8">
              <LogoMark />
            </span>
            <span className="mt-0.5 max-w-[4.5rem] text-center text-[0.55rem] font-bold leading-tight text-[var(--accent)] sm:text-[0.65rem]">
              Used Car Marketplace
            </span>
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink)] md:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>

          <div
            className={`${
              open ? "flex" : "hidden"
            } absolute left-0 right-0 top-16 z-20 flex-col gap-1 border-b border-[var(--line)] bg-white px-6 py-4 shadow-md sm:top-[4.25rem] md:static md:z-0 md:flex md:flex-row md:items-center md:gap-7 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-2 text-xs font-semibold uppercase tracking-[0.12em] transition md:py-0 ${
                    active
                      ? "text-[var(--accent)]"
                      : "text-[var(--ink)] hover:text-[var(--accent)]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile-only auth actions (desktop uses right-side cluster) */}
            {!loading && (
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--line)] pt-3 md:hidden">
                {user ? (
                  <ProfileMenu user={user} align="left" />
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink)] transition hover:text-[var(--accent)]"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-primary w-fit px-4 py-2 text-xs uppercase tracking-wider"
                      onClick={() => setOpen(false)}
                    >
                      Signup
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop right-side auth */}
          {!loading && (
            <div className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center gap-3 sm:right-6 md:flex">
              {user ? (
                <ProfileMenu user={user} align="right" />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:text-[var(--accent)]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-primary px-4 py-2 text-xs uppercase tracking-wider"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 48 32" className="h-full w-full text-[var(--accent)]" aria-hidden>
      <circle cx="24" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="16" r="3.5" fill="currentColor" />
      <path
        d="M2 16h8M38 16h8M6 12h6M36 12h6M8 20h4M36 20h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
