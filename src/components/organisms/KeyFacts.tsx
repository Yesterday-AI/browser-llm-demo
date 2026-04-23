import { cn } from "@/lib/cn.ts";
import { useT } from "@/lib/i18n/index.ts";
import { PROJECT } from "@/lib/project.ts";
import { GithubMark } from "../atoms/GithubMark.tsx";

type Fact = {
  id: "backend" | "local" | "license";
  valueKey: Parameters<ReturnType<typeof useT>>[0];
  labelKey: Parameters<ReturnType<typeof useT>>[0];
};

const FACTS: readonly Fact[] = [
  { id: "backend", valueKey: "facts.backend.value", labelKey: "facts.backend.label" },
  { id: "local", valueKey: "facts.local.value", labelKey: "facts.local.label" },
  { id: "license", valueKey: "facts.license.value", labelKey: "facts.license.label" },
];

export function KeyFacts({ className }: { className?: string }) {
  const t = useT();
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {/*
        grid-auto-flow:column + grid-rows-2 puts all labels in row 1 and all
        values in row 2 regardless of wrap count. items-end keeps short labels
        glued to the baseline of the wrapping ones → values line up perfectly.
      */}
      <dl className="grid flex-1 grid-cols-3 grid-rows-2 items-end gap-x-3 gap-y-1 text-center [grid-auto-flow:column]">
        {FACTS.flatMap((f) => [
          <dt
            key={`${f.id}-dt`}
            className="text-xs uppercase leading-tight tracking-[0.15em] text-neutral-500"
          >
            {t(f.labelKey)}
          </dt>,
          <dd key={`${f.id}-dd`} className="text-xl font-medium text-neutral-100 tabular-nums">
            {t(f.valueKey)}
          </dd>,
        ])}
      </dl>
      {PROJECT.githubUrl && (
        <a
          href={PROJECT.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
          className="flex-none self-end pb-1 text-neutral-600 transition hover:text-neutral-100"
        >
          <GithubMark className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
