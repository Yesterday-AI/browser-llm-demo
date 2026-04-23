import { cn } from "@/lib/cn.ts";
import type { ReactNode } from "react";

export type MessageBubbleProps = {
  speaker: "user" | "assistant";
  children: ReactNode;
  className?: string;
};

export function MessageBubble({ speaker, children, className }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-2 leading-relaxed",
        speaker === "user" ? "bg-neutral-800 text-neutral-50" : "px-2 text-neutral-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
