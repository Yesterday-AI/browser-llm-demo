/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Navigator {
  readonly deviceMemory?: number;
  readonly gpu?: unknown;
  readonly connection?: {
    readonly effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
    readonly saveData?: boolean;
  };
}
