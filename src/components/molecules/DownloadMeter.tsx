import { ProgressBar } from "../atoms/ProgressBar.tsx";
import { Spinner } from "../atoms/Spinner.tsx";

export type DownloadMeterProps = {
  loaded: number;
  total: number;
  label: string;
};

function formatBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} MB`;
  return `${(n / 1e3).toFixed(0)} kB`;
}

export function DownloadMeter({ loaded, total, label }: DownloadMeterProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span className="inline-flex items-center gap-2">
          <Spinner className="h-3 w-3" />
          {label}
        </span>
        <span>
          {formatBytes(loaded)} / {formatBytes(total)}
        </span>
      </div>
      <ProgressBar value={loaded} max={total || 1} />
    </div>
  );
}
