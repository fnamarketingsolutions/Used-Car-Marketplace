import type { ReactNode } from "react";

type MasterDetailLayoutProps = {
  list: ReactNode;
  detail: ReactNode;
  listLabel?: string;
  detailLabel?: string;
};

export default function MasterDetailLayout({
  list,
  detail,
  listLabel = "Items",
  detailLabel = "Details",
}: MasterDetailLayoutProps) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(14rem,18rem)_1fr] lg:gap-0 lg:border lg:border-[var(--line)]">
      <aside
        aria-label={listLabel}
        className="min-h-0 border border-[var(--line)] bg-[var(--bg)] lg:max-h-[70vh] lg:overflow-y-auto lg:border-0 lg:border-r lg:border-[var(--line)]"
      >
        {list}
      </aside>
      <section
        aria-label={detailLabel}
        className="min-w-0 border border-[var(--line)] bg-[var(--surface)] p-5 lg:max-h-[70vh] lg:overflow-y-auto lg:border-0"
      >
        {detail}
      </section>
    </div>
  );
}
