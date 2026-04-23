import { FilesetResolver, LlmInference } from "@mediapipe/tasks-genai";
import type { ModelId } from "./model-catalog.ts";
import { MODEL_CATALOG, getCacheKey, getModelUrl } from "./model-catalog.ts";
import { type DownloadProgress, loadModelWithCache } from "./opfs-cache.ts";

export type InferenceOptions = {
  maxTokens?: number;
  topK?: number;
  temperature?: number;
  randomSeed?: number;
};

// Chat-Defaults.
// WICHTIG: maxTokens in MediaPipe ist INPUT + OUTPUT combined (KV-Cache-Limit
// beim createFromOptions-Call). Gemma 4 web-variant kann nativ 128K, aber das
// wuerde 1-2 GB GPU-RAM extra kosten und Prefill quadratisch verlangsamen.
// 8192 = Chat-Sweet-Spot: ~30 Turns mit System-Prompt, kein Memory-Impact.
// Fixer randomSeed verursachte reproducible Repetition-Loops — jetzt per-Run random.
const DEFAULT_OPTIONS: Required<InferenceOptions> = {
  maxTokens: 8192,
  topK: 40,
  temperature: 0.7,
  randomSeed: 0,
};

function nextSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

const WASM_PATH = "/wasm";

// Gemma's decoder emits stop tokens as literal strings rather than halting.
// Match Gemma turn-markers plus Unicode replacement + private-use-area glyphs.
// Explicitly NOT matching punctuation like '-' (would truncate legit responses).
const GEMMA_STOP_PATTERN =
  /<\s*\/?(?:end_of_turn|start_of_turn|eos|s)\b[^>]*>|[\uFFFD\uE000-\uF8FF]/iu;

function stripGemmaTokens(text: string): string {
  const m = text.match(GEMMA_STOP_PATTERN);
  return m && m.index !== undefined ? text.slice(0, m.index).trimEnd() : text;
}

let filesetPromise: ReturnType<typeof FilesetResolver.forGenAiTasks> | null = null;

function loadFileset() {
  if (!filesetPromise) filesetPromise = FilesetResolver.forGenAiTasks(WASM_PATH);
  return filesetPromise;
}

/**
 * Warm up MediaPipe WASM while user is on idle/picker screens — overlaps
 * ~53 MB WASM download with UI display. Safe to call multiple times; cached
 * via the module-level promise and by the Service-Worker CacheFirst rule.
 */
export function preloadFileset(): void {
  void loadFileset().catch((err) => {
    console.warn("[mediapipe] fileset preload failed", err);
  });
}

export type LoadOptions = {
  modelId: ModelId;
  signal?: AbortSignal;
  onProgress?: (p: DownloadProgress) => void;
  inference?: InferenceOptions;
};

export class LocalLlm {
  private llm: LlmInference | null = null;
  private currentModelId: ModelId | null = null;

  get modelId(): ModelId | null {
    return this.currentModelId;
  }

  get ready(): boolean {
    return this.llm !== null;
  }

  async load(opts: LoadOptions): Promise<void> {
    if (this.llm) await this.close();

    const meta = MODEL_CATALOG[opts.modelId];

    // Parallelize: WASM fileset download overlaps with OPFS read / HF download.
    // `preloadFileset()` may already have kicked this off on app mount.
    const filesetPromise = loadFileset();

    const { stream, size } = await loadModelWithCache({
      url: getModelUrl(opts.modelId),
      cacheKey: getCacheKey(opts.modelId),
      expectedSize: meta.sizeBytes,
      signal: opts.signal,
      onProgress: opts.onProgress,
    });

    opts.onProgress?.({
      loadedBytes: size,
      totalBytes: size,
      phase: "initializing-runtime",
    });

    const fileset = await filesetPromise;
    const reader = stream.getReader();

    const inference = { ...DEFAULT_OPTIONS, ...opts.inference };
    const seed = inference.randomSeed || nextSeed();

    this.llm = await LlmInference.createFromOptions(fileset, {
      baseOptions: { modelAssetBuffer: reader },
      maxTokens: inference.maxTokens,
      topK: inference.topK,
      temperature: inference.temperature,
      randomSeed: seed,
    });
    this.currentModelId = opts.modelId;
  }

  async close(): Promise<void> {
    if (!this.llm) return;
    this.llm.close();
    this.llm = null;
    this.currentModelId = null;
  }

  async *generate(prompt: string, signal?: AbortSignal): AsyncGenerator<string> {
    if (!this.llm) throw new Error("LLM not loaded");
    const llm = this.llm;

    type Chunk = { partial: string; done: boolean };
    const queue: Chunk[] = [];
    let wake: (() => void) | null = null;

    const onAbort = () => {
      llm.cancelProcessing();
      wake?.();
    };
    signal?.addEventListener("abort", onAbort);

    // Kick off generation. Promise resolves when MediaPipe is fully finished
    // (natural end, maxTokens, or cancelProcessing). We MUST await it before
    // returning so the next generate() call starts from a clean state —
    // MediaPipe serializes: only one generateResponse may run at a time.
    const donePromise = llm.generateResponse(prompt, (partial, done) => {
      queue.push({ partial, done });
      wake?.();
    });

    try {
      let accumulated = "";
      let lastYielded = "";
      let stopped = false;

      while (true) {
        if (queue.length === 0) {
          await new Promise<void>((r) => {
            wake = r;
          });
          continue;
        }
        const chunk = queue.shift();
        if (!chunk) continue;

        if (!stopped) {
          accumulated += chunk.partial;
          const cleaned = stripGemmaTokens(accumulated);
          const hitStop = cleaned.length < accumulated.length;
          if (cleaned !== lastYielded) {
            lastYielded = cleaned;
            yield cleaned;
          }
          if (hitStop) {
            stopped = true;
            llm.cancelProcessing();
          }
        }

        if (chunk.done) break;
      }

      await donePromise.catch(() => {});
    } finally {
      signal?.removeEventListener("abort", onAbort);
      try {
        llm.clearCancelSignals();
      } catch {
        /* ignore */
      }
    }
  }

  sizeInTokens(text: string): number {
    return this.llm?.sizeInTokens(text) ?? 0;
  }
}
