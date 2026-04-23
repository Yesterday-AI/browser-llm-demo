import type { TranslationKey, Vars } from "./i18n/index.ts";
import { MODEL_CATALOG, type ModelId } from "./model-catalog.ts";

export type Capabilities = {
  webgpu: boolean;
  deviceMemoryGB: number | null;
  storageQuota: number;
  storageUsage: number;
  persistGranted: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  connectionType: string | null;
  saveData: boolean;
};

export async function detectCapabilities(): Promise<Capabilities> {
  const storage =
    "storage" in navigator && navigator.storage.estimate
      ? await navigator.storage.estimate()
      : { quota: 0, usage: 0 };

  const persistGranted =
    "storage" in navigator && "persisted" in navigator.storage
      ? await navigator.storage.persisted()
      : false;

  return {
    webgpu: !!navigator.gpu,
    deviceMemoryGB: navigator.deviceMemory ?? null,
    storageQuota: storage.quota ?? 0,
    storageUsage: storage.usage ?? 0,
    persistGranted,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isStandalone: window.matchMedia("(display-mode: standalone)").matches,
    connectionType: navigator.connection?.effectiveType ?? null,
    saveData: !!navigator.connection?.saveData,
  };
}

export type Warning = { key: TranslationKey; vars?: Vars };

export type ModelAvailability = {
  modelId: ModelId;
  allowed: boolean;
  warnings: Warning[];
};

export function evaluateModel(modelId: ModelId, caps: Capabilities): ModelAvailability {
  const meta = MODEL_CATALOG[modelId];
  const warnings: Warning[] = [];
  let allowed = true;

  if (caps.deviceMemoryGB !== null && caps.deviceMemoryGB < meta.minRAMGB) {
    warnings.push({
      key: "caps.notEnoughRam",
      vars: { deviceGB: caps.deviceMemoryGB, minGB: meta.minRAMGB },
    });
    if (caps.deviceMemoryGB < meta.minRAMGB / 2) {
      allowed = false;
      warnings.push({ key: "caps.ramCritical" });
    }
  }

  const free = caps.storageQuota - caps.storageUsage;
  if (caps.storageQuota > 0 && free < meta.sizeBytes * 1.05) {
    warnings.push({
      key: "caps.notEnoughStorage",
      vars: { freeGB: formatGB(free), needGB: formatGB(meta.sizeBytes) },
    });
    allowed = false;
  }

  if (!caps.webgpu) {
    warnings.push({ key: "caps.noWebgpu" });
  }

  if (caps.saveData) {
    warnings.push({ key: "caps.saveData" });
  }

  if (caps.connectionType && caps.connectionType !== "4g" && !caps.persistGranted) {
    warnings.push({
      key: "caps.slowConnection",
      vars: { type: caps.connectionType, sizeGB: formatGB(meta.sizeBytes) },
    });
  }

  return { modelId, allowed, warnings };
}

function formatGB(bytes: number): string {
  return `${(bytes / 1e9).toFixed(1)} GB`;
}
