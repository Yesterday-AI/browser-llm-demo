<div align="center">
  <img src="public/icons/icon.svg" width="88" alt="browser-llm-demo" />

  <h1>browser-llm-demo</h1>

  <p><em>An LLM that doesn't phone home.</em></p>

  <p>
    <strong><a href="https://yesterday-ai.github.io/browser-llm-demo/">▸ Try it live</a></strong>
  </p>

  <p>
    <a href="https://github.com/yesterday-ai/browser-llm-demo/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/yesterday-ai/browser-llm-demo/ci.yml?branch=main&label=CI"></a>
    <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/license-Apache%202.0-blue"></a>
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6">
    <img alt="Node" src="https://img.shields.io/badge/node-22-43853d">
  </p>
</div>

## What is this

A **scaffold** for building **browser-local LLM chat apps**. Runs Gemma 4 (2 B or 4 B) entirely in the browser via MediaPipe + WebGPU. After the first model download (~2.6 GB), the app is fully offline. No server, no API keys, no telemetry — your prompts never leave the tab.

Fork this to build your own privacy-first AI app.

<table>
<tr>
<td align="center"><strong>0</strong><br/>server calls</td>
<td align="center"><strong>100 %</strong><br/>browser-local</td>
<td align="center"><strong>Apache 2.0</strong><br/>open source</td>
</tr>
</table>

## Features

- **Gemma 4 E2B / E4B** via MediaPipe `tasks-genai` (WebGPU + WASM fallback)
- **OPFS model cache** — one-time download, instant warm starts
- **PWA** — installable, works offline, iOS / Android / Desktop
- **Multi-conversation** persistence via IndexedDB (Dexie)
- **Streaming chat** with markdown rendering + per-message stats (TTFT, tok/s)
- **i18n** (DE / EN + auto-detect), user-tunable sampling + context window
- **Atomic Design** component structure — atoms · molecules · organisms · templates · pages
- **Type-safe** end-to-end (strict TS, Biome lint)

## Quick start

```bash
pnpm install
pnpm dev
```

First run downloads ~53 MB of MediaPipe WASM into `public/wasm/` via the `predev` hook. First chat triggers a 2.6 GB Gemma 4 download from Hugging Face into OPFS — WiFi recommended.

Requires Node 22, pnpm 10, a WebGPU-capable browser (Chrome/Edge ≥ 113; Firefox works slower via wgpu; Safari ≥ 18.4).

## Stack

Vite 6 · React 19 · TypeScript strict · Tailwind CSS 4 · Biome · pnpm · MediaPipe `tasks-genai` · `@assistant-ui/react` · Dexie · Zustand · `vite-plugin-pwa`

## Using it as a scaffold

Fork the repo. Four files hold all project-specific config:

| File | Swap for new project |
|---|---|
| `src/lib/project.ts` | Name, display name, repo URL, base path |
| `src/lib/model-catalog.ts` | Supported models + per-model sizing defaults |
| `src/lib/i18n/*.ts` | UI strings + rotating taglines (`src/lib/taglines.ts`) |
| `public/icons/` · `vite.config.ts#manifest` · `index.html` | Branding, icons, theme color |

That's it. Everything else stays as-is across forks.

## Deployment

**GitHub Pages** — fork, enable Pages, push. `.github/workflows/deploy.yml` builds and deploys automatically. The bundled `public/coi-serviceworker.js` injects COOP/COEP headers at runtime, so SharedArrayBuffer (threaded WASM) works without custom server headers.

See [RELEASING.md](./RELEASING.md) for the full runbook.

## Documentation

| Document | Purpose |
|---|---|
| [AGENTS.md](./AGENTS.md) | Entry point for AI coding agents — rules, tasks, gotchas |
| [CONTEXT.md](./CONTEXT.md) | Architecture overview + data flow |
| [DECISIONS.md](./DECISIONS.md) | Architectural decision log (DEC-001 … DEC-009) |
| [ROADMAP.md](./ROADMAP.md) | Priorities + acceptance criteria |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Dev workflow + PR rules |
| [CHANGELOG.md](./CHANGELOG.md) | Keep-a-Changelog release notes |
| [SECURITY.md](./SECURITY.md) | Vulnerability reporting |

## Licenses

- **Code**: Apache 2.0 (this repo)
- **Gemma 4 models**: Apache 2.0 (Google DeepMind)
- **MediaPipe `tasks-genai`**: Apache 2.0
- **`@assistant-ui/react`**: MIT
- **`coi-serviceworker`** (bundled): MIT (Guido Zuidhof et al.)

---

Maintained by [Yesterday](https://github.com/yesterday-ai).
