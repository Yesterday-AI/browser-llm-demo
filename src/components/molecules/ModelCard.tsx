import { cn } from "@/lib/cn.ts";
import { useT } from "@/lib/i18n/index.ts";
import { Check, Cpu, Download } from "lucide-react";
import { Badge } from "../atoms/Badge.tsx";
import { WarningList } from "./WarningList.tsx";

export type ModelCardProps = {
  label: string;
  description: string;
  selected: boolean;
  cached: boolean;
  disabled?: boolean;
  warnings?: string[];
  warningTone?: "warning" | "danger";
  onSelect: () => void;
};

export function ModelCard({
  label,
  description,
  selected,
  cached,
  disabled,
  warnings = [],
  warningTone = "warning",
  onSelect,
}: ModelCardProps) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex flex-col gap-1 rounded-xl border p-3 text-left transition",
        selected
          ? "border-neutral-50 bg-neutral-900 text-neutral-50"
          : "border-neutral-800 text-neutral-100 hover:border-neutral-600 hover:bg-neutral-900/50",
        disabled && "cursor-not-allowed opacity-40 hover:border-neutral-800 hover:bg-transparent",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          {selected ? <Check className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
          {label}
        </div>
        {cached ? (
          <Badge tone="success">
            <Check className="h-3 w-3" />
            {t("picker.badge.cached")}
          </Badge>
        ) : (
          <Badge tone="neutral">
            <Download className="h-3 w-3" />
            {t("picker.badge.download")}
          </Badge>
        )}
      </div>
      <p className="text-xs text-neutral-400">{description}</p>
      <WarningList items={warnings} tone={warningTone} className="mt-1" />
    </button>
  );
}
