# Security

## Reporting Vulnerabilities

Please **do not open public issues** for security reports.

Contact: `security@yesterday.ai` (PGP optional).

We'll acknowledge within 72 hours and provide a timeline for fixes.

## Scope

- The browser-side inference runtime (MediaPipe, Gemma model loading, OPFS caching)
- The chat persistence layer (Dexie/IndexedDB handling)
- PWA service worker + cache strategy
- Any build-time tooling (Vite plugins, `copy-wasm` script)

## Out of Scope

- Vulnerabilities in upstream dependencies (`@mediapipe/tasks-genai`, `@assistant-ui/react`, etc.) — report to those projects directly
- Model-content safety (jailbreak prompts, harmful generations) — Gemma's license + Google policies apply
- Browser-zero-days

## Posture

- **No server, no API keys in client code.** Nothing to exfiltrate server-side.
- **Models are public.** `litert-community/gemma-4-*` are Apache-2.0, no gated secrets.
- **User data stays local.** Conversations live in IndexedDB, models in OPFS — never transmitted.
- **Third-party fetches:** Only `huggingface.co` (model download) and the app's origin. No analytics, no telemetry.

## Hardening

- CI runs Gitleaks on every PR to catch leaked credentials
- Strict CSP + COOP/COEP headers enforced for SharedArrayBuffer
- No `eval`, no dynamic `import()` of remote code outside the MediaPipe WASM loader
