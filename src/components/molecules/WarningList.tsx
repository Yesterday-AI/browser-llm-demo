import { cn } from "@/lib/cn.ts";
import { AlertTriangle } from "lucide-react";

export type WarningListProps = {
  items: string[];
  tone?: "warning" | "danger";
  className?: string;
};

export function WarningList({ items, tone = "warning", className }: WarningListProps) {
  if (items.length === 0) return null;
  return (
    <ul className={cn("space-y-0.5", className)}>
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex items-start gap-1.5 text-[11px]",
            tone === "warning" ? "text-amber-400" : "text-red-400",
          )}
        >
          <AlertTriangle className="mt-0.5 h-3 w-3 flex-none" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
