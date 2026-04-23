// Scaffold-Point: dieses Catalog ist die swappable Source-of-Truth fuer
// unterstuetzte Modelle. Fuer neue Projekte hier die MODEL_CATALOG-Eintraege
// durch die gewuenschten litert-community-Varianten ersetzen.

export type ModelMeta = {
  id: string;
  label: string;
  description: string;
  repo: string;
  file: string;
  sizeBytes: number;
  minRAMGB: number;
  // Max combined input+output tokens (KV-cache allocation limit).
  // Gemma 4 web-variant unterstuetzt nativ bis 128K, aber der KV-Cache skaliert
  // linear und frisst GPU-Memory. Pro-Modell tuenbar.
  maxTokens: number;
};

export const HF_BASE_URL = "https://huggingface.co";

// maxTokens = default KV-cache-Groesse. User kann via Settings-Dialog
// auf bis zu MODEL_MAX_TOKENS hochdrehen.
export const MODEL_MAX_TOKENS = 131_072; // 128K — nativer Gemma-4-Web-Ceiling

export const MODEL_CATALOG = {
  E2B: {
    id: "E2B",
    label: "Gemma 4 E2B",
    description: "Schnell · 2.6 GB · ~4 GB RAM",
    repo: "litert-community/gemma-4-E2B-it-litert-lm",
    file: "gemma-4-E2B-it-web.task",
    sizeBytes: 2_800_000_000,
    minRAMGB: 4,
    maxTokens: 32_768,
  },
  E4B: {
    id: "E4B",
    label: "Gemma 4 E4B",
    description: "Klueger · 5 GB · ~8 GB RAM",
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
