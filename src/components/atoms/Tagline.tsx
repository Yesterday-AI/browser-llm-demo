import { cn } from "@/lib/cn.ts";
import { useLocale } from "@/lib/i18n/index.ts";
import { pickTagline } from "@/lib/taglines.ts";
import { useMemo } from "react";

export function Tagline({ className }: { className?: string }) {
  const locale = useLocale();
  const tagline = useMemo(() => pickTagline(locale), [locale]);
  return (
    <p
      className={cn(
        "text-center text-[11px] font-mono tracking-wide text-neutral-600 italic",
        className,
      )}
    >
      {tagline}
    </p>
  );
}
