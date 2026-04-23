# Architecture

## Big picture

```
                  HF Hub (public)             OPFS (Browser)
                       │                          ▲
                       ▼                          │
            ┌────────────────────┐    ┌───────────────────────┐
            │  opfs-cache.ts     │───▶│  File Handle + Stream │
            │  (download+cache)  │    └───────────────────────┘
            └────────────────────┘                │
                                                  ▼
                                     ┌───────────────────────┐
                                     │  MediaPipe LlmInference│ WASM + WebGPU
                                     │  (mediapipe-llm.ts)    │ (public/wasm/)
                                     └───────────────────────┘
                                                  │ generate(prompt)
                                                  ▼
                                     ┌───────────────────────┐
                                     │  chat-store.ts        │ zustand
                                     │  (Dexie + in-memory)  │
                                     └───────────────────────┘
                                                  │
                                                  ▼
                                     ┌───────────────────────┐
                                     │  useExternalStoreRt   │ assistant-ui
                                     │  (useLlmRuntime.ts)   │
                                     └───────────────────────┘
                                                  │
                                                  ▼
                                          React Components
                                          (ChatShell, ChatThread,
                                           Sidebar, ModelPicker)
```

## Key files

| File | Role |
|---|---|
| `src/lib/project.ts` | Project identity (name, displayName, GitHub URL, base path) |
| `src/lib/model-catalog.ts` | Swappable model list (scaffold point) |
| `src/lib/opfs-cache.ts` | HF download + OPFS cache with progress + abort |
| `src/lib/mediapipe-llm.ts` | MediaPipe wrapper, callback → async-generator bridge |
| `src/lib/prompt-template.ts` | Gemma turn formatting |
| `src/lib/llm-store.ts` | LLM load state (Zustand) |
| `src/lib/chat-store.ts` | Conversation state + Dexie persistence (Zustand + persist) |
| `src/lib/db.ts` | Dexie schema (conversations, messages) |
| `src/lib/capabilities.ts` | Browser capability checks + model eligibility |
| `src/lib/settings-store.ts` | User-editable sampling, context, locale, system prompt |
| `src/lib/i18n/{de,en,types,index}.ts` | Lean i18n (no framework) |
| `src/lib/taglines.ts` | Rotating privacy taglines (per locale) |
| `src/lib/asset-path.ts` | `import.meta.env.BASE_URL` prefixing for runtime asset refs |
| `src/hooks/useLlmRuntime.ts` | `useExternalStoreRuntime` adapter |
| `src/components/pages/ChatShell.tsx` | Top-level layout, model-picker flow |
| `src/components/organisms/ChatThread.tsx` | Thread + composer (assistant-ui primitives) |
| `src/sw.ts` | Service Worker — Workbox precache + COI header injection |
| `scripts/copy-wasm.mjs` | `predev`/`prebuild` — copies MediaPipe WASM from node_modules to public/wasm |

## Data flow

1. **Model download**: `ChatShell` → `llm-store.load()` → `mediapipe-llm.load()` → `opfs-cache.loadModelWithCache()` → stream `tee()`'d, one half into MediaPipe, the other into OPFS
2. **Inference**: user message via `useLlmRuntime.onNew()` → `chat-store.sendUserMessage()` → Dexie write + streaming state update → `llm-store.llm.generate()` yields chunks → store update → React re-render
3. **Persistence**: messages flushed to Dexie after stream end; conversation list reactive via `useLiveQuery` in the sidebar

## Critical patterns

- **Callback → AsyncGenerator** in `mediapipe-llm.ts#generate()` — MediaPipe exposes a callback API, assistant-ui expects an AsyncGenerator
- **Stream tee()** in `opfs-cache.ts#loadModelWithCache()` — one fetch, two consumers (MediaPipe + cache writer)
- **Sidecar `_size` file** — cache validation without re-hashing multi-GB blobs
- **External-store runtime** instead of `useLocalRuntime` — we own the message array; assistant-ui only renders
- **Atomic Design layering** — atoms never import from molecules/organisms; organisms may import stores

## Mobile + PWA

- `viewport-fit=cover` + `env(safe-area-inset-*)` for notches
- `interactive-widget=resizes-content` for iOS keyboard
- Service Worker: app-shell precached, WASM CacheFirst, HF bypasses the SW entirely
- Model files live in OPFS, NOT in the SW cache

## COOP / COEP

MediaPipe uses SharedArrayBuffer → needs `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` + `Cross-Origin-Resource-Policy: cross-origin`. Dev server sets them via `vite.config.ts`. On GitHub Pages (which can't set custom headers), `src/sw.ts` injects them client-side via a Workbox plugin (`fetchDidSucceed` + `cachedResponseWillBeUsed`). HF Hub downloads go straight through `fetch()` and bypass the SW.

## Open questions / roadmap

See `ROADMAP.md` and `README.md`. AG-UI protocol layer, MCP tools, RAG, voice I/O, light theme, Playwright tests are all tracked there.
