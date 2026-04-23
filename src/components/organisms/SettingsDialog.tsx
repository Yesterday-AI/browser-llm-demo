import {
  LOCALES,
  LOCALE_LABELS,
  type LocaleSetting,
  translate,
  useLocale,
  useT,
} from "@/lib/i18n/index.ts";
import { useLlmStore } from "@/lib/llm-store.ts";
import { MODEL_CATALOG, MODEL_MAX_TOKENS } from "@/lib/model-catalog.ts";
import { DEFAULT_SETTINGS, useSettingsStore } from "@/lib/settings-store.ts";
import { RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../atoms/Button.tsx";
import { IconButton } from "../molecules/IconButton.tsx";
import { SliderField } from "../molecules/SliderField.tsx";

function formatTokens(n: number): string {
  if (n >= 1024) return `${(n / 1024).toFixed(0)}K`;
  return `${n}`;
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SettingsDialog({ open, onClose }: Props) {
  const t = useT();
  const locale = useLocale();
  const settings = useSettingsStore();
  const modelId = useLlmStore((s) => s.modelId);
  const state = useLlmStore((s) => s.state);
  const modelMaxDefault = MODEL_CATALOG[modelId].maxTokens;

  const effectiveSystemPrompt =
    settings.systemPrompt === null
      ? translate(locale, "systemPrompt.default")
      : settings.systemPrompt;

  const [draft, setDraft] = useState({
    maxTokens: settings.maxTokens ?? modelMaxDefault,
    temperature: settings.temperature,
    topK: settings.topK,
    systemPrompt: effectiveSystemPrompt,
    locale: settings.locale,
  });

  if (!open) return null;

  const needsReload =
    state.kind === "ready" &&
    (draft.maxTokens !== (settings.maxTokens ?? modelMaxDefault) ||
      draft.temperature !== settings.temperature ||
      draft.topK !== settings.topK);

  const save = () => {
    const defaultForLocale = translate(locale, "systemPrompt.default");
    settings.set({
      maxTokens: draft.maxTokens === modelMaxDefault ? null : draft.maxTokens,
      temperature: draft.temperature,
      topK: draft.topK,
      // If user kept the default text verbatim, persist as null so locale-switch updates it.
      systemPrompt: draft.systemPrompt === defaultForLocale ? null : draft.systemPrompt,
      locale: draft.locale,
    });
    onClose();
  };

  const reset = () => {
    const defaultForLocale = translate(locale, "systemPrompt.default");
    setDraft({
      maxTokens: modelMaxDefault,
      temperature: DEFAULT_SETTINGS.temperature,
      topK: DEFAULT_SETTINGS.topK,
      systemPrompt: defaultForLocale,
      locale: DEFAULT_SETTINGS.locale,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label={t("settings.close")}
        onClick={onClose}
        className="absolute inset-0 -z-10"
      />
      <div className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-neutral-100 shadow-xl">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
            {t("settings.title")}
          </h2>
          <IconButton
            variant="ghost"
            size="sm"
            icon={<X className="h-4 w-4" />}
            label={t("settings.close")}
            onClick={onClose}
          />
        </header>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-neutral-400">
              {t("settings.locale.label")}
            </span>
            <select
              value={draft.locale}
              onChange={(e) => setDraft((d) => ({ ...d, locale: e.target.value as LocaleSetting }))}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-sm text-neutral-100 focus:border-neutral-600 focus:outline-none"
            >
              <option value="auto">{t("settings.locale.auto")}</option>
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {LOCALE_LABELS[l]}
                </option>
              ))}
            </select>
          </label>

          <SliderField
            label={t("settings.maxTokens.label", { max: formatTokens(MODEL_MAX_TOKENS) })}
            value={draft.maxTokens}
            min={2048}
            max={MODEL_MAX_TOKENS}
            step={2048}
            onChange={(v) => setDraft((d) => ({ ...d, maxTokens: v }))}
            format={formatTokens}
            hint={t("settings.maxTokens.hint", {
              max: formatTokens(MODEL_MAX_TOKENS),
              model: MODEL_CATALOG[modelId].label,
              current: formatTokens(modelMaxDefault),
            })}
          />

          <SliderField
            label={t("settings.temperature.label")}
            value={draft.temperature}
            min={0}
            max={2}
            step={0.1}
            onChange={(v) => setDraft((d) => ({ ...d, temperature: v }))}
            format={(v) => v.toFixed(1)}
            hint={t("settings.temperature.hint")}
          />

          <SliderField
            label={t("settings.topK.label")}
            value={draft.topK}
            min={1}
            max={128}
            step={1}
            onChange={(v) => setDraft((d) => ({ ...d, topK: v }))}
            hint={t("settings.topK.hint")}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-wide text-neutral-400">
              {t("settings.systemPrompt.label")}
            </span>
            <textarea
              value={draft.systemPrompt}
              onChange={(e) => setDraft((d) => ({ ...d, systemPrompt: e.target.value }))}
              rows={6}
              className="resize-none rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-neutral-600 focus:outline-none"
              placeholder={t("settings.systemPrompt.placeholder")}
            />
            <span className="text-[11px] text-neutral-500">{t("settings.systemPrompt.hint")}</span>
          </label>
        </div>

        {needsReload && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-[11px] text-amber-400">
            {t("settings.reloadHint")}
          </div>
        )}

        <footer className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" />
            {t("settings.reset")}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t("settings.cancel")}
            </Button>
            <Button size="sm" onClick={save}>
              {t("settings.save")}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
