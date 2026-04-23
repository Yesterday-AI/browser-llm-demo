import { cn } from "@/lib/cn.ts";

export type ProgressBarProps = {
  value: number;
  max?: number;
  className?: string;
  indeterminate?: boolean;
};

export function ProgressBar({ value, max = 100, className, indeterminate }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-neutral-800", className)}
      role="progressbar"
      tabIndex={-1}
      aria-valuenow={indeterminate ? undefined : pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full bg-neutral-50 transition-[width] duration-200",
          indeterminate && "animate-pulse",
        )}
        style={{ width: indeterminate ? "40%" : `${pct}%` }}
      />
    </div>
  );
}
