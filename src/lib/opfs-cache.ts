// Ported from google-ai-edge/mediapipe-samples/examples/llm_inference/llm_chat_ts/src/opfs_cache.ts
// (Apache-2.0). Changes: progress callback, AbortController, UI warnings instead of alert(),
// explicit persist() request. Not ported: the OAuth flow (litert-community models are public).

export type DownloadPhase = "checking-cache" | "downloading" | "cached" | "initializing-runtime";

export type DownloadProgress = {
  loadedBytes: number;
  totalBytes: number;
  phase: DownloadPhase;
};

export type LoadModelOptions = {
  url: string;
  cacheKey: string;
  expectedSize: number;
  signal?: AbortSignal;
  onProgress?: (p: DownloadProgress) => void;
};

const SIZE_SUFFIX = "_size";

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  if (!("storage" in navigator) || !("getDirectory" in navigator.storage)) {
    throw new Error("OPFS not available — browser too old");
  }
  return await navigator.storage.getDirectory();
}

async function readSidecar(
  root: FileSystemDirectoryHandle,
  cacheKey: string,
): Promise<number | null> {
  try {
    const handle = await root.getFileHandle(cacheKey + SIZE_SUFFIX);
    const file = await handle.getFile();
    const text = await file.text();
    const n = Number.parseInt(text, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

async function writeSidecar(
  root: FileSystemDirectoryHandle,
  cacheKey: string,
  size: number,
): Promise<void> {
  const handle = await root.getFileHandle(cacheKey + SIZE_SUFFIX, { create: true });
  const writable = await handle.createWritable();
  await writable.write(String(size));
  await writable.close();
}

async function tryReadCached(
  root: FileSystemDirectoryHandle,
  cacheKey: string,
): Promise<{ stream: ReadableStream<Uint8Array>; size: number } | null> {
  try {
    const handle = await root.getFileHandle(cacheKey);
    const file = await handle.getFile();
    const sidecarSize = await readSidecar(root, cacheKey);
    if (sidecarSize === null || file.size !== sidecarSize) {
      return null;
    }
    return { stream: file.stream(), size: file.size };
  } catch {
    return null;
  }
}

async function ensureQuota(required: number): Promise<void> {
  const estimate = await navigator.storage.estimate();
  const available = (estimate.quota ?? 0) - (estimate.usage ?? 0);
  if (available < required * 1.05) {
    throw new Error(
      `Not enough browser cache space (available ${formatBytes(available)}, need ${formatBytes(required)})`,
    );
  }
}

function formatBytes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  return `${(n / 1e3).toFixed(0)} kB`;
}

export async function loadModelWithCache(
  opts: LoadModelOptions,
): Promise<{ stream: ReadableStream<Uint8Array>; size: number }> {
  const { url, cacheKey, expectedSize, signal, onProgress } = opts;

  onProgress?.({ loadedBytes: 0, totalBytes: expectedSize, phase: "checking-cache" });

  const root = await getRoot();

  const cached = await tryReadCached(root, cacheKey);
  if (cached) {
    onProgress?.({ loadedBytes: cached.size, totalBytes: cached.size, phase: "cached" });
    return cached;
  }

  await ensureQuota(expectedSize);

  onProgress?.({ loadedBytes: 0, totalBytes: expectedSize, phase: "downloading" });

  const response = await fetch(url, { signal });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: HTTP ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length")) || expectedSize;
  let loaded = 0;

  const tracker = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      loaded += chunk.byteLength;
      onProgress?.({
        loadedBytes: loaded,
        totalBytes: contentLength,
        phase: "downloading",
      });
      controller.enqueue(chunk);
    },
  });

  const tracked = response.body.pipeThrough(tracker);
  const [forClient, forCache] = tracked.tee();

  const handle = await root.getFileHandle(cacheKey, { create: true });
  const writable = await handle.createWritable();

  forCache
    .pipeTo(writable, { signal })
    .then(async () => {
      await writeSidecar(root, cacheKey, contentLength);
      await requestPersistence();
      onProgress?.({
        loadedBytes: contentLength,
        totalBytes: contentLength,
        phase: "cached",
      });
    })
    .catch(async (err) => {
      console.error("[opfs-cache] write failed", err);
      try {
        await root.removeEntry(cacheKey);
      } catch {
        /* ignore */
      }
    });

  return { stream: forClient, size: contentLength };
}

export async function getCachedModels(): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  try {
    const root = await getRoot();
    for await (const [name, handle] of root.entries()) {
      if (name.endsWith(SIZE_SUFFIX)) continue;
      if (handle.kind !== "file") continue;
      const file = await (handle as FileSystemFileHandle).getFile();
      result.set(name, file.size);
    }
  } catch (err) {
    console.error("[opfs-cache] listing failed", err);
  }
  return result;
}

export async function removeCachedModel(cacheKey: string): Promise<void> {
  const root = await getRoot();
  try {
    await root.removeEntry(cacheKey);
  } catch {
    /* not present */
  }
  try {
    await root.removeEntry(cacheKey + SIZE_SUFFIX);
  } catch {
    /* not present */
  }
}

export async function removeAllCachedModels(): Promise<void> {
  const root = await getRoot();
  const names: string[] = [];
  for await (const name of root.keys()) names.push(name);
  for (const name of names) {
    try {
      await root.removeEntry(name);
    } catch {
      /* ignore */
    }
  }
}

export async function requestPersistence(): Promise<boolean> {
  if (!("storage" in navigator) || !("persist" in navigator.storage)) return false;
  const already = await navigator.storage.persisted();
  if (already) return true;
  return await navigator.storage.persist();
}

export async function getStorageInfo(): Promise<{ quota: number; usage: number }> {
  const e = await navigator.storage.estimate();
  return { quota: e.quota ?? 0, usage: e.usage ?? 0 };
}
