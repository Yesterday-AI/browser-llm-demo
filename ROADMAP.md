# Roadmap

Prioritized features and extensions. Each entry has priority, status, why, constraints, approach, and acceptance criteria.

## Done (in 0.1.0)

- **PWA PNG icon upgrade** (2026-04-23) — real 192/512 PNGs + SVG fallback + maskable variant in the manifest
- **i18n DE + EN** (2026-04-24) — see entry below. See DEC-007.
- **User-editable settings dialog** (2026-04-24) — maxTokens, sampling, system prompt, locale. See DEC-009.
- **Per-message stats** (2026-04-24) — TTFT, duration, token count, tok/s
- **GitHub Pages deploy + in-SW COI injection** (2026-04-24) — see DEC-008

## High

### Live end-to-end test with real MediaPipe format

- **Status**: Not started
- **Why**: `.task` format compatibility with `@mediapipe/tasks-genai@0.10.27` hasn't been verified in a live session. Risk: format mismatch blocks the download → load flow.
- **Constraints**: Test must run in a real browser (Desktop Chrome + Android), not just unit tests.
- **Approach**: `pnpm dev` → download the model → send a first prompt → verify streaming. If the format doesn't match, try `.litertlm` instead of `.task`.
- **Acceptance criteria**: E2B and E4B both load without errors, both stream tokens, reload uses the OPFS cache.

## Medium

### AG-UI protocol layer

- **Status**: Not started
- **Why**: Future-proofing for multi-agent scenarios; the Deutschland-Stack lists AG-UI (sandbox) for public-sector contexts.
- **Constraints**: In-process agent stays the default, AG-UI is an additive layer.
- **Approach**: An `AbstractAgent` subclass `LocalGemmaAgent` that emits MediaPipe generator chunks as `TEXT_MESSAGE_CONTENT` events via an RxJS Observable. `useLlmRuntime` remains available; users can switch between modes.
- **Acceptance criteria**: The same conversations work with the AG-UI runtime AND the external-store runtime; switch via config flag.

### MCP tool use

- **Status**: Not started
- **Why**: Agent capabilities beyond plain chat (web fetch, calculator, local tools).
- **Constraints**: Gemma 4 has to support function calling reliably; MVP supports public MCP servers only (no auth).
- **Approach**: `@modelcontextprotocol/sdk` client in the browser, tool definitions woven into the prompt, tool calls parsed from model output and dispatched to the MCP server.
- **Acceptance criteria**: At least one test tool (calculator) works end-to-end; errors are surfaced in the chat.

### RAG with `@mediapipe/tasks-text` embeddings

- **Status**: Not started
- **Why**: Local context injection (documents, notes) without any cloud dependency.
- **Constraints**: All in-browser, no server. The embedding index must fit in IndexedDB.
- **Approach**: `TextEmbedder` via MediaPipe, embeddings in IndexedDB with cosine-similarity search (no dedicated vector DB in-browser).
- **Acceptance criteria**: 100-document index, query < 200 ms p95, relevant chunks are injected into the prompt.

### i18n (DE / EN)

- **Status**: Done (2026-04-24)
- **Why**: The scaffold is used for varied customers — German UI is the Yesterday default, but English must be an option.
- **Approach**: Custom `useT()` without a framework (~40 LOC), string keys in `src/lib/i18n/{de,en}.ts`, language detection via `navigator.language`, UI override in the settings dialog.
- **Outcome**: All user-facing strings via `t()`, system language auto-detect, manual override in settings (`auto` | `de` | `en`). See DEC-007.

## Low

### Persona presets

- **Status**: Not started
- **Why**: Recurring system prompts (assistant, coder, creative writer) without retyping them every time.
- **Approach**: Own Dexie table + UI picker in conversation settings.
- **Acceptance criteria**: At least 3 presets, per-conversation selection, custom personas persistable.

### Voice I/O

- **Status**: Not started
- **Why**: Accessibility + mobile UX.
- **Approach**: Web Speech API for input (STT), TTS via `SpeechSynthesis`. Optional on-device Whisper for better quality.
- **Acceptance criteria**: Push-to-talk in the composer, TTS button on assistant bubbles.

### Export / import conversations (Markdown / JSON)

- **Status**: Not started
- **Why**: Backup + sharing.
- **Approach**: Download button per conversation → Markdown with metadata in frontmatter. Import button reads the structure back.
- **Acceptance criteria**: Round-trip export → import preserves message IDs, timestamps, roles.

### Light theme

- **Status**: Not started
- **Why**: Dark-only was the MVP tradeoff (see DEC-005). Some users genuinely prefer light.
- **Approach**: Theme tokens in `@theme` (instead of hardcoded Tailwind classes for brand colors), `data-theme` attribute on `<html>`, settings toggle.
- **Acceptance criteria**: Both themes render correctly across all atoms/molecules/organisms, no regressions to contrast/accessibility.

### Playwright E2E tests

- **Status**: Not started
- **Why**: Regression safety before prod deployment.
- **Constraints**: CI can't pull a 2 GB model → needs a mock LLM adapter for tests.
- **Approach**: `@playwright/test`, mock adapter yielding predefined tokens, scenarios: download flow, chat send, conversation switch.
- **Acceptance criteria**: At least 5 scenarios green in < 30 s total.

### Alternative models (Qwen, DeepSeek)

- **Status**: Not started
- **Why**: Not every use case fits Gemma; multilingual customers may prefer Qwen.
- **Approach**: As soon as `litert-community` offers other models in `.task` format, extend `MODEL_CATALOG`.
- **Acceptance criteria**: At least one non-Gemma model is selectable; prompt-template abstraction handles both formats.

### `<input type=file>` offline model loading

- **Status**: Not started
- **Why**: Kiosk / air-gapped / corporate firewalls blocking HF.
- **Approach**: File picker in the download UI accepts `.task` files directly, stores them in OPFS under the known key.
- **Acceptance criteria**: Drag-n-drop or file-picker loads a local model, rest of the flow identical.

### Cloudflare R2 mirror

- **Status**: Not started
- **Why**: Independence from HF Hub, control over bandwidth.
- **Constraints**: Budget for R2 storage (~EUR 1/month), own domain.
- **Approach**: Public-read R2 bucket mirroring the model files; extend `MODEL_CATALOG` with an alternative `repo`/`url` source.
- **Acceptance criteria**: Download source is switchable via env variable, no code changes needed to toggle R2.

### Mobile-friendly sub-800 MB quantized models

- **Status**: Not started
- **Why**: iOS WKWebView Jetsam-kills tabs at ~800 MB RAM — Gemma 4 E2B (~2 GB) and E4B (~4 GB) are both physically unable to run on iPhone/iPad, regardless of PWA install or `persist()`. The iOS warning in `evaluateModel()` currently hard-blocks both on iOS. A sub-800 MB model would unblock mobile.
- **Constraints**: Needs a quantization (INT4 or smaller) the MediaPipe `tasks-genai` runtime can load. Waiting for litert-community or similar to publish one.
- **Approach**: Track the litert-community HF org for new `.task` releases; when a small model appears (e.g. Gemma 3 1B or Qwen 0.5B in INT4), add to `MODEL_CATALOG` with `sizeBytes < 800_000_000` so the iOS block auto-lifts.
- **Acceptance criteria**: At least one model loads and runs on an iPhone 12 Pro without Jetsam; observed tok/s documented.

### Native wrapper (Expo + llama.cpp) for mobile

- **Status**: Not started
- **Why**: The browser path is capped by WKWebView memory. Native apps get the full device RAM budget (~4-5 GB on iPhone 12 Pro) — so Gemma 4 E2B or even E4B becomes feasible on mobile.
- **Constraints**: Significant scope change — this would be a sibling project, not a fork of this scaffold. Different distribution (App Store / TestFlight / sideload), different dev loop, different code layer (Swift/Kotlin wrapper around llama.cpp or MLX).
- **Approach**: Expo with a custom native module exposing llama.cpp, sharing the chat UI via React Native (the i18n + taglines + atomic-design layer are portable). IndexedDB + OPFS swap for AsyncStorage + FileSystem.
- **Acceptance criteria**: Gemma 4 E2B runs on iPhone 12 Pro via native app with > 10 tok/s; shared UI code with the browser scaffold reaches > 60 %.
