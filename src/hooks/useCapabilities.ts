import { type Capabilities, detectCapabilities } from "@/lib/capabilities.ts";
import { MODEL_CATALOG, type ModelId, getCacheKey } from "@/lib/model-catalog.ts";
import { getCachedModels } from "@/lib/opfs-cache.ts";
import { useEffect, useState } from "react";

export type CachedStatus = Record<ModelId, boolean>;

export function useCapabilities() {
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [cached, setCached] = useState<CachedStatus | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is the trigger
  useEffect(() => {
    void (async () => {
      const [c, cachedMap] = await Promise.all([detectCapabilities(), getCachedModels()]);
      const status = Object.fromEntries(
        (Object.keys(MODEL_CATALOG) as ModelId[]).map((id) => [id, cachedMap.has(getCacheKey(id))]),
      ) as CachedStatus;
      setCaps(c);
      setCached(status);
    })();
  }, [refreshKey]);

  return { caps, cached, refresh: () => setRefreshKey((k) => k + 1) };
}
