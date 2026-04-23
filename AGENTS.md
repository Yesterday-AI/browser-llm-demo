# Agents Guide

Dieses Repo ist ein **Browser-LLM-Chat-Scaffold** (Yesterday). Du bist hier richtig gelandet — lies diesen File, dann nach Bedarf weiter.

## Reading Order

1. **AGENTS.md** (hier) — Regeln, Tasks, Gotchas
2. **CONTEXT.md** — Architektur-Big-Picture, Datenfluss, kritische Patterns
3. **DECISIONS.md** — Warum die wichtigen Entscheidungen so fielen (DEC-001 … DEC-009)
4. **ROADMAP.md** — Was kommt, mit Acceptance-Criteria
5. **CONTRIBUTING.md** — Dev-Workflow + PR-Regeln
6. Source-Code: `src/lib/` (Domain-Logik) → `src/hooks/` (Adapter) → `src/components/` (UI)

## Build & Test

```bash
pnpm install           # einmalig
pnpm dev               # Dev-Server, COOP/COEP-Headers gesetzt
pnpm lint              # Biome
pnpm typecheck         # tsc -b --noEmit
pnpm build             # Production + PWA-SW
```

Vor jedem PR: `pnpm lint && pnpm typecheck && pnpm build` — alle drei gruen.

## Regeln

- **Verifikation vor Claim**: nach jeder relevanten Aenderung `pnpm typecheck` UND `pnpm build`, nicht nur typecheck.
- **Keine Modelle committen**: OPFS-Cache bleibt im Browser, nie nach Disk exportieren. `public/wasm/` ist `.gitignore`d.
- **Keine destruktiven Datei-Operationen** — siehe globale CLAUDE.md.
- **Biome fuer Formatting + Lint** — nicht ESLint/Prettier dazumixen.
- **Async-Generator Bridge in `mediapipe-llm.ts`** nicht anfassen ohne Verstaendnis — MediaPipe-Callback und AbortSignal-Handling sind zusammen fragil.
- **Stream tee() im OPFS-Cache** nicht umbauen — beide Branches muessen parallel konsumiert werden, sonst backpressure-Deadlock.
- **External-Store-Runtime, nicht LocalRuntime** — wir halten Messages selbst in Dexie + Zustand.

## Typische Tasks

| Task | Pfad |
|---|---|
| Neues Modell hinzufuegen | `src/lib/model-catalog.ts` erweitern |
| UI-Komponente hinzufuegen | `src/components/` + assistant-ui Primitives |
| Persistenz-Schema erweitern | `src/lib/db.ts` Version bumpen (Dexie migration) |
| Branding anpassen | `src/lib/project.ts`, `public/icons/icon.svg`, `index.html` |
| Neue Sprache hinzufuegen | neue `src/lib/i18n/<locale>.ts` + `LOCALES` + `LOCALE_LABELS` + `DICTS` in `index.ts` + `detectLocale` |
| Neue Tagline dazu | `src/lib/taglines.ts` pro Sprache |
| Default-Sampling aendern | `src/lib/mediapipe-llm.ts#DEFAULT_OPTIONS` |
| Deploy-Workflow | `.github/workflows/deploy.yml`; Base-Path via `PROJECT.basePath` |
| Prompt-Format fuer anderes Modell | `src/lib/prompt-template.ts` |
| PWA-Caching anpassen | `vite.config.ts#VitePWA.workbox.runtimeCaching` |

## Nicht tun

- Kein HTTP-Backend-Layer — der Point ist Serverless-Browser.
- Keine OpenAI-SDK-Stubs — wir nutzen ausschliesslich `@mediapipe/tasks-genai`.
- Keine `alert()` / `confirm()` — UI via React-Components.
- Keine Model-Files in `public/` oder Git-LFS — nur WASM (via `copy-wasm`).
- Keine harten `localhost`-URLs — Modelle kommen aus HF Hub (direkt) oder zukuenftig R2-Mirror (via Env).

## Debugging

- Chrome DevTools → Application → Storage → OPFS: Model-Files sichtbar
- Application → IndexedDB → `browser-llm-demo`: Conversations + Messages
- Application → Service Workers: SW Status (nur in Production-Build aktiv)
- Network → Filter `wasm`: sieht WASM-CacheFirst-Hits
- `navigator.storage.estimate()` in Console: Quota-Status

## Upstream-Referenz

Port-Quellen (Apache-2.0):

- `https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/llm_inference/llm_chat_ts`
- `opfs_cache.ts` und `llm_service.ts` sind die Kern-Referenzen fuer OPFS- und MediaPipe-Interop.

## Gotchas

- **iOS Safari < 18.4**: keine WebGPU → CPU-Fallback, E2B zaeh, E4B nicht sinnvoll
- **OPFS-Quota unter iOS**: ~1 GB default, via `persist()` erweiterbar
- **PWA Install-Prompt**: Android-Chrome automatisch, iOS manuell "Zum Home-Bildschirm"
- **SharedArrayBuffer**: braucht COOP/COEP — bei GitHub Pages via `coi-serviceworker` (siehe DEC-008) automatisch
- **HF-Rate-Limits**: unwahrscheinlich bei Direct-Downloads, aber bei vielen Users evtl. Mirror noetig
- **Shader-Compile-Latenz**: 10–25 s beim ersten Load pro Session, danach Browser-WebGPU-Cache greift
- **Firefox ~30–50 % langsamer** als Chrome (wgpu vs Dawn + OPFS SQLite). Feature, nicht Bug.
- **Stop-Token-Leak**: Gemma emittet manchmal `<end_of_turn>` literal. Regex in `mediapipe-llm.ts#GEMMA_STOP_PATTERN` + `cancelProcessing()` fangen das
- **Doppel-BOS vermeiden**: MediaPipes Tokenizer prepended BOS automatisch — nicht manuell in `renderGemmaPrompt` einfuegen
