# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-04-24

Initial public release. Ships as a scaffold for building browser-local LLM chat apps.

### Added

- Vite 6 + React 19 + TypeScript (strict) + Tailwind CSS 4 + Biome foundation
- Gemma 4 E2B / E4B inference via `@mediapipe/tasks-genai` (WebGPU + WASM fallback)
- Direct model download from `litert-community` HF mirrors with OPFS cache, progress, abort
- Multi-conversation persistence via Dexie / IndexedDB
- assistant-ui chat with `useExternalStoreRuntime`, streaming, stop button, stop-token filter
- Model picker with capability detection (WebGPU, `deviceMemory`, OPFS quota, connection type)
- Per-message stats (TTFT, total duration, output tokens, tok/s) with tooltip labels
- Settings dialog: user-editable max tokens (2K–128K), temperature, top-K, system prompt, locale
- i18n: German + English dictionaries, `navigator.language` auto-detect, `useT()` hook (~40 LOC, no framework)
- Rotating privacy taglines on the landing page ("An LLM that doesn't phone home", etc.)
- Key-facts footer: `0` server calls · `100 %` browser-local · `Apache 2.0` + GitHub link
- PWA: manifest, installable, offline indicator, install prompt
- Custom service worker (`src/sw.ts`) — Workbox precache + runtime cache for WASM + client-side COOP/COEP header injection so SharedArrayBuffer works on GitHub Pages (see DEC-008)
- Atomic Design component structure: atoms · molecules · organisms · templates · pages
- Dark-theme only (see DEC-005)
- `AsteriskAnimation` atom for load / generation waiting states
- Governance docs: DECISIONS.md, ROADMAP.md, CONTRIBUTING.md, AGENTS.md, CONTEXT.md, SECURITY.md, RELEASING.md
- GitHub Actions workflows: CI (lint, typecheck, build, TruffleHog secret scan) + Pages deploy

### Known Limitations

- iOS Safari < 18.4: no WebGPU, E4B not recommended
- No test suite yet (Vitest + Playwright in roadmap)
- Firefox runs ~30 – 50 % slower than Chrome (wgpu vs Dawn + OPFS SQLite-backed)
- No resumable downloads — closing the tab mid-download loses progress
- First `generateResponse` after model load is slow: 10–25 s WebGPU shader compile

[0.1.0]: https://github.com/yesterday-ai/browser-llm-demo/releases/tag/v0.1.0
