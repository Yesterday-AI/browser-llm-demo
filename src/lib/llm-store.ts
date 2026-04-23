import { create } from "zustand";
import { LocalLlm } from "./mediapipe-llm.ts";
import type { ModelId } from "./model-catalog.ts";
import { DEFAULT_MODEL_ID, MODEL_CATALOG } from "./model-catalog.ts";
import type { DownloadProgress } from "./opfs-cache.ts";
import { useSettingsStore } from "./settings-store.ts";

export type LoadState =
  | { kind: "idle" }
  | { kind: "loading"; progress: DownloadProgress }
  | { kind: "ready" }
  | { kind: "error"; message: string };

export type LoadStats = {
  durationMs: number;
  fromCache: boolean;
};

type LlmStore = {
  llm: LocalLlm;
  modelId: ModelId;
  state: LoadState;
  abort: AbortController | null;
  stats: LoadStats | null;

  load: (modelId: ModelId) => Promise<void>;
  cancel: () => void;
  unload: () => Promise<void>;
};

export const useLlmStore = create<LlmStore>((set, get) => ({
  llm: new LocalLlm(),
  modelId: DEFAULT_MODEL_ID,
  state: { kind: "idle" },
  abort: null,
  stats: null,

  load: async (modelId) => {
    const { llm } = get();
    const ctrl = new AbortController();
    set({
      modelId,
      abort: ctrl,
      stats: null,
      state: {
        kind: "loading",
        progress: { loadedBytes: 0, totalBytes: 0, phase: "checking-cache" },
      },
    });
    const startedAt = performance.now();
    let fromCache = false;
    try {
      const settings = useSettingsStore.getState();
      const modelMax = MODEL_CATALOG[modelId].maxTokens;
      await llm.load({
        modelId,
        signal: ctrl.signal,
        onProgress: (p) => {
          if (get().abort !== ctrl) return;
          if (p.phase === "cached") fromCache = true;
          set({ state: { kind: "loading", progress: p } });
        },
        inference: {
          maxTokens: settings.maxTokens ?? modelMax,
          temperature: settings.temperature,
          topK: settings.topK,
        },
      });
      set({
        state: { kind: "ready" },
        abort: null,
        stats: { durationMs: performance.now() - startedAt, fromCache },
      });
    } catch (err) {
      if (ctrl.signal.aborted) {
        set({ state: { kind: "idle" }, abort: null });
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      set({ state: { kind: "error", message }, abort: null });
    }
  },

  cancel: () => {
    const { abort } = get();
    abort?.abort();
  },

  unload: async () => {
    set({ stats: null });
    const { llm, abort } = get();
    abort?.abort();
    await llm.close();
    set({ state: { kind: "idle" }, abort: null });
  },
}));
