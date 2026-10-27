"use client";

import Image from "next/image";
import Link from "next/link";

const AUTH_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80";

export default function AuthSplitLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[var(--bg)]">
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <Image
          src={AUTH_IMAGE}
          alt="Used car marketplace"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            Used Car Marketplace
          </p>
          <p className="mt-3 max-w-md font-display text-3xl font-bold leading-tight">
            Buy and sell verified used cars with confidence.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            aria-label="Go to homepage"
            className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <HomeIcon />
          </Link>
          {title ? (
            <p className="sr-only">{title}</p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 11.5 12 4l8 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 10.5V20h11V10.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
