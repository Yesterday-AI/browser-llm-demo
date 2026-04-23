import { cn } from "@/lib/cn.ts";
import { useEffect, useState } from "react";

// Claude-inspired asterisk morph. Easing on first+last frame, snappy middle.
const FRAMES = ["·", "✦", "✶", "✳", "✵", "✸", "+"];
const FRAME_MS = [143, 143, 143, 143, 143, 143, 142];

const SIZE_CLASSES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
} as const;

export type AsteriskAnimationProps = {
  phases?: readonly string[];
  phaseMs?: number;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
};

export function AsteriskAnimation({
  phases,
  phaseMs = 2000,
  size = "md",
  className,
}: AsteriskAnimationProps) {
  const [frame, setFrame] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      setFrame((f) => {
        const next = (f + 1) % FRAMES.length;
        t = setTimeout(step, FRAME_MS[next]);
        return next;
      });
    };
    t = setTimeout(step, FRAME_MS[0]);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!phases || phases.length <= 1) return;
    const i = setInterval(() => setPhase((p) => (p + 1) % phases.length), phaseMs);
    return () => clearInterval(i);
  }, [phases, phaseMs]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "font-mono leading-none text-neutral-300 transition-all duration-75",
          SIZE_CLASSES[size],
        )}
      >
        {FRAMES[frame]}
      </span>
      {phases && phases.length > 0 && (
        <span className="font-mono text-[11px] tracking-wide text-neutral-500">
          {phases[phase]}
        </span>
      )}
    </div>
  );
}
