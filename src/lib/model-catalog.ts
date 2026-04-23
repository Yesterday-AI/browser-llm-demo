// Scaffold point: this catalog is the swappable source of truth for supported
// models. Forks replace the MODEL_CATALOG entries with their preferred
// litert-community variants.

export type ModelMeta = {
  id: string;
  label: string;
  description: string;
  repo: string;
  file: string;
  sizeBytes: number;
  minRAMGB: number;
  // Max combined input + output tokens (KV cache allocation limit).
  // The Gemma 4 web variant supports up to 128K natively, but the KV cache
  // scales linearly in GPU memory. Tunable per model.
  maxTokens: number;
};

export const HF_BASE_URL = "https://huggingface.co";

// maxTokens = default KV cache size. Users can bump up to MODEL_MAX_TOKENS
// via the settings dialog.
export const MODEL_MAX_TOKENS = 131_072; // 128K — native ceiling of the Gemma 4 web variant

export const MODEL_CATALOG = {
  E2B: {
    id: "E2B",
    label: "Gemma 4 E2B",
    description: "Fast · 2.6 GB · ~4 GB RAM",
    repo: "litert-community/gemma-4-E2B-it-litert-lm",
    file: "gemma-4-E2B-it-web.task",
    sizeBytes: 2_800_000_000,
    minRAMGB: 4,
    maxTokens: 32_768,
  },
  E4B: {
    id: "E4B",
    label: "Gemma 4 E4B",
    description: "Smarter · 5 GB · ~8 GB RAM",
    repo: "litert-community/gemma-4-E4B-it-litert-lm",
    file: "gemma-4-E4B-it-web.task",
    sizeBytes: 5_000_000_000,
    minRAMGB: 8,
    maxTokens: 16_384,
  },
} as const satisfies Record<string, ModelMeta>;

export type ModelId = keyof typeof MODEL_CATALOG;

export const MODEL_IDS = Object.keys(MODEL_CATALOG) as ModelId[];

export const DEFAULT_MODEL_ID: ModelId = "E2B";

export function getModelUrl(id: ModelId): string {
  const m = MODEL_CATALOG[id];
  return `${HF_BASE_URL}/${m.repo}/resolve/main/${m.file}`;
}

export function getCacheKey(id: ModelId): string {
  return MODEL_CATALOG[id].file;
}
