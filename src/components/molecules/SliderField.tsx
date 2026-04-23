import { cn } from "@/lib/cn.ts";

export type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: string;
  className?: string;
};

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  hint,
  className,
}: SliderFieldProps) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="flex items-baseline justify-between text-xs uppercase tracking-wide text-neutral-400">
        <span>{label}</span>
        <span className="font-mono text-neutral-200 normal-case tracking-normal">
          {format ? format(value) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-800 accent-neutral-50 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-50 [&::-webkit-slider-thumb]:shadow"
      />
      {hint && <span className="text-[11px] text-neutral-500">{hint}</span>}
    </label>
  );
}
