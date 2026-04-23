import type { CachedStatus } from "@/hooks/useCapabilities.ts";
import type { Capabilities } from "@/lib/capabilities.ts";
import { evaluateModel } from "@/lib/capabilities.ts";
import { useT } from "@/lib/i18n/index.ts";
import { MODEL_CATALOG, MODEL_IDS, type ModelId } from "@/lib/model-catalog.ts";
import { ModelCard } from "../molecules/ModelCard.tsx";

type Props = {
  selectedId: ModelId;
  onSelect: (id: ModelId) => void;
  caps: Capabilities;
  cached: CachedStatus;
  disabled?: boolean;
};

export function ModelPicker({ selectedId, onSelect, caps, cached, disabled }: Props) {
  const t = useT();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-wide text-neutral-500">{t("picker.label")}</span>
      <div className="flex flex-col gap-2">
        {MODEL_IDS.map((id) => {
          const meta = MODEL_CATALOG[id];
          const evaluation = evaluateModel(id, caps);
          const warnings = evaluation.warnings.map((w) => t(w.key, w.vars));
          return (
            <ModelCard
              key={id}
              label={meta.label}
              description={t(`picker.description.${id}`)}
              selected={id === selectedId}
              cached={cached[id]}
              disabled={disabled || !evaluation.allowed}
              warnings={warnings}
              warningTone={evaluation.allowed ? "warning" : "danger"}
              onSelect={() => onSelect(id)}
            />
          );
        })}
      </div>
    </div>
  );
}
