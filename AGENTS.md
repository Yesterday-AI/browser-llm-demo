# Agents Guide

This repo is a **browser-local LLM chat scaffold** maintained by Yesterday. You've landed in the right place — read this file first, then branch out as needed.

## Reading order

1. **AGENTS.md** (here) — rules, tasks, gotchas
2. **CONTEXT.md** — architecture big picture, data flow, critical patterns
3. **DECISIONS.md** — why the important decisions went the way they did (DEC-001 … DEC-009)
4. **ROADMAP.md** — what's coming, with acceptance criteria
5. **CONTRIBUTING.md** — dev workflow + PR rules
6. Source: `src/lib/` (domain logic) → `src/hooks/` (adapters) → `src/components/` (UI)

## Build & test

```bash
pnpm install           # once
pnpm dev               # dev server, COOP/COEP headers set
pnpm lint              # Biome
pnpm typecheck         # tsc -b --noEmit
pnpm build             # production + PWA SW
```

Before every PR: `pnpm lint && pnpm typecheck && pnpm build` — all three green.

## Rules

- **Verify before claiming**: after any relevant change run `pnpm typecheck` AND `pnpm build`, not just typecheck.
- **Never commit models**: the OPFS cache stays in the browser, never export to disk. `public/wasm/` is gitignored.
- **No destructive file operations** — see the global CLAUDE.md.
- **Biome for formatting + lint** — don't mix in ESLint/Prettier.
- **Don't touch the async-generator bridge in `mediapipe-llm.ts`** without understanding it — MediaPipe's callback API and the AbortSignal handling are fragile together.
- **Don't restructure the stream `tee()` in the OPFS cache** — both branches must be consumed in parallel or backpressure deadlocks.
- **External-store runtime, not LocalRuntime** — we hold messages ourselves in Dexie + Zustand.

## Typical tasks

| Task | Where |
|---|---|
| Add a new model | extend `src/lib/model-catalog.ts` |
| Add a UI component | `src/components/` + assistant-ui primitives |
| Extend the persistence schema | bump `src/lib/db.ts` version (Dexie migration) |
| Change branding | `src/lib/project.ts`, `public/icons/icon.svg`, `index.html` |
| Add a language | new `src/lib/i18n/<locale>.ts` + `LOCALES` + `LOCALE_LABELS` + `DICTS` in `index.ts` + `detectLocale` |
| Add a tagline | `src/lib/taglines.ts` per language |
| Change default sampling | `src/lib/mediapipe-llm.ts#DEFAULT_OPTIONS` |
| Deploy pipeline | `.github/workflows/deploy.yml`; base path via `PROJECT.basePath` |
| Prompt format for a different model | `src/lib/prompt-template.ts` |
| Adjust PWA caching | `src/sw.ts` (routes, plugins, COI header injection) |

## Don't do

- No HTTP backend layer — the point is serverless-in-browser.
- No OpenAI-SDK stubs — we use `@mediapipe/tasks-genai` exclusively.
- No `alert()` / `confirm()` — UI through React components only.
- No model files in `public/` or Git-LFS — only WASM (via `copy-wasm`).
- No hardcoded `localhost` URLs — models come from HF Hub directly or (future) an R2 mirror.

## Debugging

- Chrome DevTools → Application → Storage → OPFS: model files visible
- Application → IndexedDB → `browser-llm-demo`: conversations + messages
- Application → Service Workers: SW status (only active in production builds)
- Network → filter `wasm`: WASM CacheFirst hits
- `navigator.storage.estimate()` in console: quota status
- `window.crossOriginIsolated` in console: must be `true` for threaded WASM

## Upstream reference

Port sources (Apache-2.0):

- `https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/llm_inference/llm_chat_ts`
- `opfs_cache.ts` and `llm_service.ts` are the core references for OPFS + MediaPipe interop.

## Gotchas

- **iOS Safari < 18.4**: no WebGPU → CPU fallback, E2B is slow, E4B not viable
- **OPFS quota on iOS**: ~1 GB default, extendable via `persist()`
- **PWA install prompt**: automatic on Android Chrome, manual "Add to Home Screen" on iOS
- **SharedArrayBuffer**: needs COOP/COEP — on GitHub Pages we inject them via `src/sw.ts` (see DEC-008)
- **HF rate limits**: unlikely for direct downloads, but may need a mirror at scale
- **Shader compile latency**: 10–25 s on first session load, then the browser WebGPU cache kicks in
- **Firefox ~30–50 % slower** than Chrome (wgpu vs Dawn + SQLite-backed OPFS). Feature, not bug.
- **Stop-token leak**: Gemma sometimes emits `<end_of_turn>` as a literal string. The regex in `mediapipe-llm.ts#GEMMA_STOP_PATTERN` + `cancelProcessing()` catch it.
- **Avoid double BOS**: MediaPipe's tokenizer prepends BOS automatically — don't add one manually in `renderGemmaPrompt`.
- **Two SWs collide**: never register multiple service workers for the same scope. All SW logic lives in `src/sw.ts`.
