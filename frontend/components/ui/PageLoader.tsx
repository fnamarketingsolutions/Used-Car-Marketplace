import Spinner from "@/components/ui/Spinner";

export default function PageLoader({
  label,
  fullScreen = false,
  className = "",
}: {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-[var(--muted)] ${
        fullScreen ? "min-h-screen bg-[var(--bg)]" : "py-12"
      } ${className}`}
    >
      <Spinner size={fullScreen ? "lg" : "md"} />
      {label ? <p className="text-sm">{label}</p> : null}
    </div>
  );
}
