import type { MessageStats } from "@/lib/db.ts";
import { useT } from "@/lib/i18n/index.ts";
import { Clock, Gauge, Hash, Zap } from "lucide-react";

function fmtMs(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function MessageStatsFooter({ stats }: { stats: MessageStats }) {
  const t = useT();
  return (
    <div className="mt-1.5 flex items-center gap-3 text-[10px] text-neutral-500 tabular-nums">
      <span className="inline-flex items-center gap-1" title={t("stats.ttft")}>
        <Zap className="h-3 w-3" />
        {fmtMs(stats.ttftMs)}
      </span>
      <span className="inline-flex items-center gap-1" title={t("stats.duration")}>
        <Clock className="h-3 w-3" />
        {fmtMs(stats.durationMs)}
      </span>
      <span className="inline-flex items-center gap-1" title={t("stats.tokens")}>
        <Hash className="h-3 w-3" />
        {stats.outputTokens}
      </span>
      <span className="inline-flex items-center gap-1" title={t("stats.tokensPerSecond")}>
        <Gauge className="h-3 w-3" />
        {stats.tokensPerSecond.toFixed(1)} tok/s
      </span>
    </div>
  );
}
