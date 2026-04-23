import { useT } from "@/lib/i18n/index.ts";
import type { LoadState } from "@/lib/llm-store.ts";
import type { DownloadPhase } from "@/lib/opfs-cache.ts";
import { Download, X } from "lucide-react";
import { AsteriskAnimation } from "../atoms/AsteriskAnimation.tsx";
import { Button } from "../atoms/Button.tsx";
import { DownloadMeter } from "../molecules/DownloadMeter.tsx";

const PHASE_KEYS: Record<DownloadPhase, string> = {
  "checking-cache": "download.phase.checkingCache",
  downloading: "download.phase.downloading",
  cached: "download.phase.cached",
  "initializing-runtime": "download.phase.initializing",
};

type Props = {
  state: LoadState;
  modelLabel: string;
  onStart: () => void;
  onCancel: () => void;
};

export function DownloadProgress({ state, modelLabel, onStart, onCancel }: Props) {
  const t = useT();
  if (state.kind === "ready") return null;

  const initPhases = [
    t("download.initPhase.0"),
    t("download.initPhase.1"),
    t("download.initPhase.2"),
    t("download.initPhase.3"),
    t("download.initPhase.4"),
  ];

  return (
    <div className="mx-auto flex max-w-md flex-col items-stretch gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 text-neutral-100">
      <header className="flex items-center gap-3">
        <Download className="h-5 w-5 flex-none" aria-hidden="true" />
        <div className="flex-1">
          <div className="font-medium">{modelLabel}</div>
          <div className="text-xs text-neutral-500">{t("download.subtitle")}</div>
        </div>
      </header>

      {state.kind === "idle" && (
        <Button variant="primary" size="lg" onClick={onStart}>
          {t("download.loadButton")}
        </Button>
      )}

      {state.kind === "loading" && state.progress.phase === "initializing-runtime" && (
        <div className="flex flex-col items-center gap-4 py-4">
          <AsteriskAnimation phases={initPhases} phaseMs={2400} size="lg" />
          <p className="max-w-xs text-center text-[11px] text-neutral-500">
            {t("download.initHint")}
          </p>
        </div>
      )}

      {state.kind === "loading" && state.progress.phase !== "initializing-runtime" && (
        <>
          <DownloadMeter
            loaded={state.progress.loadedBytes}
            total={state.progress.totalBytes}
            label={t(PHASE_KEYS[state.progress.phase] as never)}
          />
          <Button variant="secondary" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
            {t("download.cancel")}
          </Button>
        </>
      )}

      {state.kind === "error" && (
        <>
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{state.message}</p>
          <Button variant="secondary" onClick={onStart}>
            {t("download.retry")}
          </Button>
        </>
      )}
    </div>
  );
}
