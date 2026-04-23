import { useT } from "@/lib/i18n/index.ts";
import { PROJECT } from "@/lib/project.ts";
import { Menu, RefreshCw, Settings } from "lucide-react";
import { BrandMark } from "../atoms/BrandMark.tsx";
import { Button } from "../atoms/Button.tsx";
import { StatusDot } from "../atoms/StatusDot.tsx";
import { IconButton } from "../molecules/IconButton.tsx";
import { OfflineIndicator } from "./OfflineIndicator.tsx";

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export type HeaderProps = {
  modelLabel: string;
  ready: boolean;
  loadMs?: number | null;
  loadFromCache?: boolean;
  onToggleDrawer: () => void;
  onSwap: () => void;
  onOpenSettings: () => void;
};

export function Header({
  modelLabel,
  ready,
  loadMs,
  loadFromCache,
  onToggleDrawer,
  onSwap,
  onOpenSettings,
}: HeaderProps) {
  const t = useT();
  const statusText = ready
    ? loadMs != null
      ? `${t("header.ready")} · ${fmtDuration(loadMs)}${loadFromCache ? ` · ${t("header.cached")}` : ""}`
      : t("header.ready")
    : t("header.notReady");

  return (
    <header className="flex items-center justify-between gap-2 border-b border-neutral-800/50 px-3 py-3 text-sm">
      <div className="flex min-w-0 items-center gap-2">
        {ready && (
          <IconButton
            variant="ghost"
            size="sm"
            icon={<Menu className="h-4 w-4" />}
            label={t("header.drawer")}
            onClick={onToggleDrawer}
            className="sm:hidden"
          />
        )}
        <BrandMark size="md" />
        <span className="font-semibold text-neutral-50">{PROJECT.displayName}</span>
        <span className="text-neutral-600">·</span>
        <span className="truncate text-neutral-400">{modelLabel}</span>
      </div>
      <div className="flex items-center gap-2">
        <OfflineIndicator />
        <span
          className={`inline-flex items-center gap-1.5 text-xs tabular-nums ${
            ready ? "text-emerald-400" : "text-neutral-500"
          }`}
        >
          <StatusDot tone={ready ? "success" : "neutral"} />
          {statusText}
        </span>
        <IconButton
          variant="ghost"
          size="sm"
          icon={<Settings className="h-4 w-4" />}
          label={t("header.settings")}
          onClick={onOpenSettings}
        />
        {ready && (
          <Button variant="secondary" size="sm" onClick={onSwap} title={t("header.swapModel")}>
            <RefreshCw className="h-3 w-3" />
            {t("header.swapModelShort")}
          </Button>
        )}
      </div>
    </header>
  );
}
