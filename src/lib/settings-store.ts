import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocaleSetting } from "./i18n/index.ts";

export type Settings = {
  // Combined input+output token ceiling (KV-cache allocation).
  // `null` = follow per-model default (MODEL_CATALOG[id].maxTokens).
  maxTokens: number | null;
  temperature: number;
  topK: number;
  // `null` = use locale-translated default system prompt.
  // `""` = explicitly no system prompt.
  // Any other string = custom override.
  systemPrompt: string | null;
  locale: LocaleSetting;
};

const DEFAULT_SETTINGS: Settings = {
  maxTokens: null,
  temperature: 0.7,
  topK: 40,
  systemPrompt: null,
  locale: "auto",
};

type SettingsStore = Settings & {
  set: (patch: Partial<Settings>) => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (setState) => ({
      ...DEFAULT_SETTINGS,
      set: (patch) => setState(patch),
      reset: () => setState(DEFAULT_SETTINGS),
    }),
    {
      name: "browser-llm-demo:settings",
      partialize: (s): Settings => ({
        maxTokens: s.maxTokens,
        temperature: s.temperature,
        topK: s.topK,
        systemPrompt: s.systemPrompt,
        locale: s.locale,
      }),
    },
  ),
);

export { DEFAULT_SETTINGS };
