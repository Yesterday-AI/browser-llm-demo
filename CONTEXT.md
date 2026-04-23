# Architektur

## Big Picture

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

## Wichtige Dateien

| File | Rolle |
|---|---|
| `src/lib/model-catalog.ts` | Swappable Modell-Liste (Scaffold-Point) |
| `src/lib/opfs-cache.ts` | Download + OPFS-Cache mit Progress + Abort |
| `src/lib/mediapipe-llm.ts` | MediaPipe-Wrapper, Callback→Async-Generator Bridge |
| `src/lib/prompt-template.ts` | Gemma-Turn-Formatting |
| `src/lib/llm-store.ts` | LLM-Load-State (Zustand) |
| `src/lib/chat-store.ts` | Conversation-State + Dexie-Persistenz (Zustand + Persist) |
| `src/lib/db.ts` | Dexie-Schema (conversations, messages) |
| `src/lib/capabilities.ts` | Browser-Fähigkeiten pruefen + Modell-Eignung |
| `src/hooks/useLlmRuntime.ts` | `useExternalStoreRuntime` Adapter |
| `src/components/ChatShell.tsx` | Top-Level-Layout, Model-Picker-Flow |
| `src/components/ChatThread.tsx` | Thread + Composer (assistant-ui primitives) |
| `scripts/copy-wasm.mjs` | `predev`/`prebuild` — MediaPipe-WASM aus node_modules nach public/wasm |

## Datenfluss

1. **Modell-Download**: `ChatShell` → `llm-store.load()` → `mediapipe-llm.load()` → `opfs-cache.loadModelWithCache()` → Stream tee'd, eine Haelfte an MediaPipe, andere in OPFS
2. **Inferenz**: User-Message via `useLlmRuntime.onNew()` → `chat-store.sendUserMessage()` → Dexie + Stream-Update → `llm-store.llm.generate()` yields chunks → store-update → React re-render
3. **Persistenz**: Messages nach Stream-Ende nach Dexie; Conversation-Liste via `useLiveQuery` reaktiv in Sidebar

## Kritische Patterns

- **Callback→AsyncGenerator**: `mediapipe-llm.ts#generate()` — MediaPipe hat callback API, assistant-ui will AsyncGenerator
- **Stream-tee**: `opfs-cache.ts#loadModelWithCache()` — ein Fetch, zwei Verbraucher (MediaPipe + Cache-Writer)
- **Sidecar _size-File**: Cache-Validierung ohne vollstaendiges Re-Hash
- **External-Store-Runtime**: statt `useLocalRuntime` — wir halten Messages selbst, assistant-ui rendert nur

## Mobile + PWA

- `viewport-fit=cover` + `env(safe-area-inset-*)` fuer Notches
- `interactive-widget=resizes-content` fuer iOS-Keyboard
- Service Worker: App-Shell precached, WASM CacheFirst, HF NetworkOnly
- Model-Files leben in OPFS, NICHT im SW-Cache

## COOP/COEP

MediaPipe nutzt SharedArrayBuffer → `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` in `vite.config.ts`. HF-Hub-Downloads gehen via `fetch()` (keine Embed-Restriction).

## Offene Entscheidungen / Roadmap

Siehe Plan-File und README. AG-UI-Protocol-Layer, MCP-Tools, RAG, i18n in der Roadmap.
