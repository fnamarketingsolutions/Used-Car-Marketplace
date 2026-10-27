"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import ProfileMenu from "@/components/dashboard/ProfileMenu";
import PageLoader from "@/components/ui/PageLoader";

export default function DashboardLayout({
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
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
      return;
    }
    if (user.role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }
    if (!user.phoneNumber && pathname !== "/dashboard/profile") {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/complete-profile?next=${next}`);
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (loading) {
    return <PageLoader fullScreen label="Loading dashboard…" />;
  }

  if (!user) {
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
            Me nu
          </button>
          <div className="min-w-0">
           
            <p className="truncate text-sm font-semibold text-[var(--ink)]">
              {user.fullName}
            </p>
          </div>
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
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Menu
            </p>
            <DashboardSidebar />
          </div>
        </aside>

        <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
