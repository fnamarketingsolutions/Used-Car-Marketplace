type SpinnerSize = "sm" | "md" | "lg";

const sizeClass: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-[2.5px]",
  lg: "h-11 w-11 border-[3px]",
};

export default function Spinner({
  size = "md",
  className = "",
}: {
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-[var(--accent)] border-r-transparent ${sizeClass[size]} ${className}`}
    />
  );
}
