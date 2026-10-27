"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function SellPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/login?next=/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24 text-center text-[var(--muted)]">
      Redirecting you to sell from your dashboard…
    </div>
  );
}
