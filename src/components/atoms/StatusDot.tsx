import { cn } from "@/lib/cn.ts";
import { type VariantProps, cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const dotVariants = cva("h-2 w-2 flex-none rounded-full", {
  variants: {
    tone: {
      neutral: "bg-neutral-500",
      success: "bg-emerald-400",
      warning: "bg-amber-400",
      danger: "bg-red-500",
      info: "bg-sky-400",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: { tone: "neutral", pulse: false },
});

export type StatusDotProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof dotVariants>;

export function StatusDot({ className, tone, pulse, ...props }: StatusDotProps) {
  return <span className={cn(dotVariants({ tone, pulse }), className)} {...props} />;
}
