"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import ProfileMenu from "@/components/dashboard/ProfileMenu";
import PageLoader from "@/components/ui/PageLoader";
import { useAuth } from "@/lib/auth/AuthProvider";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/admin/dashboard");
      router.replace(`/login?next=${next}`);
      return;
    }
    if (user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (loading) {
    return <PageLoader fullScreen label="Loading admin…" />;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--bg)]">
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-4 border-b border-[var(--line)] bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded border border-[var(--line)] px-2.5 py-1.5 text-sm text-[var(--ink)] lg:hidden"
            aria-expanded={mobileNavOpen}
            aria-label="Toggle menu"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            Menu
          </button>
          <Link
            href="/admin/dashboard"
            className="truncate text-sm font-semibold text-[var(--accent)]"
          >
            Admin · Used Car Marketplace
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NotificationBell />
          <ProfileMenu user={user} align="right" />
        </div>
      </header>

      <div className="flex w-full flex-1">
        <aside
          className={`${
            mobileNavOpen ? "flex" : "hidden"
          } w-full shrink-0 border-b border-[var(--line)] bg-[var(--surface)] px-3 py-3 lg:flex lg:w-60 lg:border-b-0 lg:border-r lg:px-4 lg:py-6`}
        >
          <div className="w-full">
            <div className="mb-4 flex flex-col items-center px-3">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line)] bg-white text-lg font-semibold text-[var(--ink)]"
                aria-hidden
              >
                {initials(user.fullName)}
              </div>
              <p className="mt-2 max-w-full truncate text-center text-sm font-semibold text-[var(--ink)]">
                {user.fullName}
              </p>
            </div>
            <AdminSidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
