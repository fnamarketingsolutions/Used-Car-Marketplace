"use client";

import type { ReactNode } from "react";
import { RefreshIcon } from "@/components/ui/NavIcons";

type AdminPageHeaderImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
};

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  onRefresh: () => void;
  refreshing?: boolean;
  image?: AdminPageHeaderImage;
  titleIcon?: ReactNode;
  children?: React.ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  onRefresh,
  refreshing = false,
  image,
  titleIcon,
  children,
}: AdminPageHeaderProps) {
  const refreshButton = (
    <button
      type="button"
      className="inline-flex h-9 w-9 items-center justify-center rounded text-[var(--accent)] transition-transform duration-150 hover:text-[var(--accent-strong)] active:scale-90 active:rotate-45 disabled:opacity-60"
      onClick={onRefresh}
      disabled={refreshing}
      aria-label={refreshing ? "Refreshing" : "Refresh"}
      title={refreshing ? "Refreshing…" : "Refresh"}
    >
      <RefreshIcon
        className={`h-5 w-5 shrink-0 ${refreshing ? "animate-spin" : ""}`}
      />
    </button>
  );

  const titleBlock = (
    <div className="flex min-w-0 items-start gap-3">
      {titleIcon ? (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--accent)]"
          aria-hidden
        >
          {titleIcon}
        </div>
      ) : null}
      <div className="min-w-0">
        <h1 className="section-title mt-0 text-[1.75rem] sm:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="section-copy mt-2 text-sm sm:text-base">{description}</p>
        ) : null}
      </div>
    </div>
  );

  if (image) {
    return (
      <div className="mb-6">
        <div className="mb-3 flex justify-end gap-2">
          {children}
          {refreshButton}
        </div>
        <section className="relative flex items-center gap-4 overflow-hidden border-b border-[var(--line)] pb-6 lg:gap-8">
          <div className="relative z-[1] min-w-0 flex-1">{titleBlock}</div>
          <img
            src={image.src}
            alt={image.alt ?? ""}
            width={image.width}
            height={image.height}
            className="pointer-events-none hidden h-48 w-auto shrink-0 object-contain md:block lg:h-56 xl:h-64"
            decoding="async"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>{titleBlock}</div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {refreshButton}
      </div>
    </div>
  );
}
