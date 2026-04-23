# Decision Log

Architectural decisions for `browser-llm-demo`. Each entry records status, date, owner, and rationale.
New decisions start as `proposed` and are promoted to `accepted` by the owner.

---

## DEC-001: MediaPipe `tasks-genai` as the browser LLM runtime

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: We use `@mediapipe/tasks-genai` (Google LiteRT WASM) for browser-local Gemma 4 inference.
- **Rationale**: The only production-ready browser runtime with official Gemma 4 support (via the `litert-community` mirror). WebLLM (MLC) requires custom model conversion; `transformers.js` has no Gemma 4 path yet. MediaPipe ships WebGPU acceleration + WASM fallback out of the box.
- **Affected modules**:
  - `src/lib/mediapipe-llm.ts`
  - `scripts/copy-wasm.mjs`
  - `vite.config.ts` (COOP/COEP headers + WASM runtime cache)

---

## DEC-002: Direct HF download + OPFS cache (no auth, no mirror)

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: Models are loaded via plain `fetch()` directly from `huggingface.co/litert-community/*` and cached in OPFS.
- **Rationale**: `litert-community` models are public + ungated + Apache-2.0 — no token needed. The `@huggingface/hub` library used in the upstream sample adds an OAuth layer we don't need. OPFS is the only browser storage API with file-handle semantics suitable for multi-GB blobs. A self-hosted mirror (R2/MinIO) only becomes relevant if HF as a single point of failure is a concern (roadmap).
- **Affected modules**:
  - `src/lib/opfs-cache.ts`
  - `src/lib/model-catalog.ts`

---

## DEC-003: `useExternalStoreRuntime` (not `useLocalRuntime`)

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: assistant-ui is wired through `useExternalStoreRuntime`; messages live in Zustand + Dexie.
- **Rationale**: `useLocalRuntime` keeps exactly one thread in memory. For multi-conversation with persistence we need to own the messages ourselves — the external-store adapter also gives us the `threadList` hook that feeds `ThreadListPrimitive` in the sidebar.
- **Affected modules**:
  - `src/hooks/useLlmRuntime.ts`
  - `src/lib/chat-store.ts`
  - `src/lib/db.ts`
  - `src/components/organisms/ConversationSidebar.tsx`

---

## DEC-004: Atomic Design folder structure

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: Components are organized per Brad Frost's Atomic Design: `atoms / molecules / organisms / templates / pages`.
- **Rationale**: Clear dependency direction (atoms know nothing about the domain; organisms may pull stores) simplifies scaffold reuse. The alternative — a flat `components/` — became unwieldy past 7 files.
- **Affected modules**:
  - `src/components/{atoms,molecules,organisms,templates,pages}/`

---

## DEC-005: Dark-theme-only for the MVP

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: The app renders dark-theme only. No Tailwind `dark:` variants, no `prefers-color-scheme: light` branch.
- **Rationale**: An initial dual-theme attempt collapsed because Tailwind's `dark:` prefix and the body CSS media query contradicted each other (light background with light text in dark mode — invisible cards). Dark-only eliminates the entire bug class, reduces class noise, and matches the brand. Light mode is a roadmap item.
- **Affected modules**:
  - `src/styles.css`
  - All `src/components/**`

---

## DEC-006: Vite 6 + `vite-plugin-pwa` (not Next.js)

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: Build stack is Vite + vite-plugin-pwa. No SSR framework.
- **Rationale**: The app is 100 % client-side (the LLM runs in the browser). SSR would be pure overhead. Vite produces a lean bundle (~520 KB), the PWA plugin is mature, COOP/COEP headers are easy to set. Matches the Yesterday stack.
- **Affected modules**:
  - `vite.config.ts`
  - `package.json`

---

## DEC-007: Lean i18n without react-i18next

- **Status**: accepted
- **Date**: 2026-04-24
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: Custom typed `useT()` + two flat dictionaries (`de.ts`, `en.ts`) instead of react-i18next / FormatJS.
- **Rationale**: A chat prototype has ~70 strings — react-i18next (30+ KB) is overkill. Our implementation is ~40 lines: `translate(locale, key, vars)` + a `useT()` hook + auto-locale via `navigator.language`. TypeScript key validation via `keyof typeof de`. Scaffold-fork friendly: a new language is a new file, no runtime framework knowledge required.
- **Affected modules**:
  - `src/lib/i18n/{de,en,types,index}.ts`
  - `src/lib/taglines.ts`
  - `src/components/**` (all user-facing components)

---

## DEC-008: GitHub Pages + in-SW COI header injection (not Cloudflare)

- **Status**: accepted
- **Date**: 2026-04-24
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: Deploy via GitHub Pages. COOP/COEP headers are injected client-side by the service worker (`src/sw.ts`).
- **Rationale**: MediaPipe needs `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` for SharedArrayBuffer (threaded WASM). GitHub Pages doesn't support custom response headers. Cloudflare Pages would be technically simpler (native `_headers` support) but conflicts with the "free + open" spirit of this scaffold. Our `src/sw.ts` merges Workbox precache/runtime-cache with COI header injection via plugin hooks (`fetchDidSucceed` + `cachedResponseWillBeUsed`) — a single service worker, no scope collisions. Earlier attempt with the standalone `coi-serviceworker.js` alongside vite-plugin-pwa's generated SW failed due to dueling SWs at the same scope (last registered wins).
- **Affected modules**:
  - `src/sw.ts`
  - `vite.config.ts` (strategies: "injectManifest", base path, manifest)
  - `.github/workflows/deploy.yml`

---

## DEC-009: User-editable settings (maxTokens, sampling, system prompt, locale)

- **Status**: accepted
- **Date**: 2026-04-24
- **Owner**: Yesterday founder
- **Proposed-by**: Claude Code
- **Decision**: Settings dialog persisted in `localStorage`; per-model defaults in `MODEL_CATALOG`; user override via sliders.
- **Rationale**: The initial default of `maxTokens: 1024` was too small (it is combined input + output; E2B natively supports up to 128K). But KV cache scales linearly with GPU RAM. Per-model default (E2B: 32K, E4B: 16K) + user override up to `MODEL_MAX_TOKENS` (128K). Same logic for temperature (0.7) and top-K (40) — Google's general-generation defaults (1.0 / 64) were too creative for chat. System prompt tri-state: `null` = i18n default, `""` = no system prompt, custom string = override. Locale: `auto` | `de` | `en`.
- **Affected modules**:
  - `src/lib/settings-store.ts`
  - `src/lib/model-catalog.ts` (per-model `maxTokens` + `MODEL_MAX_TOKENS`)
  - `src/components/organisms/SettingsDialog.tsx`
  - `src/components/molecules/SliderField.tsx`
  - `src/lib/llm-store.ts` (reads settings at load time)
  - `src/lib/chat-store.ts` (reads locale + systemPrompt at turn time)

---

## Template for new decisions

```markdown
## DEC-00X: <title>

- **Status**: proposed | accepted | superseded
- **Date**: YYYY-MM-DD
- **Owner**: Yesterday founder
- **Proposed-by**: <agent-or-human>
- **Decision**: <one sentence>
- **Rationale**: <why this over the alternatives>
- **Supersedes**: DEC-00Y (optional)
- **Affected modules**:
    - `src/...`
```
