import type { ComponentType, ReactNode } from "react";

type IconComponent = ComponentType<{ className?: string }>;

type DashboardPageHeaderProps = {
  icon: IconComponent;
  title: string;
  description: string;
  iconBesideTitle?: boolean;
  children?: ReactNode;
};

export default function DashboardPageHeader({
  icon: Icon,
  title,
  description,
  iconBesideTitle = false,
  children,
}: DashboardPageHeaderProps) {
  const iconBox = (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[#E53E3E] ${
        iconBesideTitle ? "h-11 w-11" : "mt-0.5 h-8 w-8"
      }`}
      aria-hidden
    >
      <Icon className={iconBesideTitle ? "h-6 w-6 shrink-0" : "h-4 w-4 shrink-0"} />
    </div>
  );

  if (iconBesideTitle) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {iconBox}
            <h1 className="section-title mt-0">{title}</h1>
          </div>
          <p className="section-copy mt-3 max-w-2xl">{description}</p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {iconBox}
        <div className="min-w-0">
          <h1 className="section-title mt-0">{title}</h1>
          <p className="section-copy mt-3 max-w-2xl">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
