# Roadmap

Priorisierte Features und Erweiterungen. Jeder Eintrag hat Priority, Status, Problem, Constraints, Approach, Acceptance-Criteria.

## Done (in 0.1.0)

- PWA Icons PNG Upgrade (2026-04-23)
- i18n DE + EN (2026-04-24) — see below entry
- User-editable Settings Dialog (2026-04-24) — maxTokens, sampling, system prompt, locale. See DEC-009.
- Per-message Stats (2026-04-24) — TTFT, duration, token count, tok/s
- GitHub Pages Deploy + `coi-serviceworker` (2026-04-24) — see DEC-008

## High

### PWA-Icons PNG-Upgrade fertigstellen

- **Status**: Done (2026-04-23)
- **Why**: Chrome/Edge bevorzugen PNG fuer A2HS-Install-Criteria; SVG-only Icons werden teilweise abgelehnt.
- **Approach**: Echte 192/512-PNGs + SVG-Fallback im Manifest, separate maskable-Variante.
- **Acceptance criteria**: Lighthouse PWA-Audit ≥ 90, Android-Chrome zeigt Install-Prompt automatisch.

### Live-E2E-Test MediaPipe-Format

- **Status**: Not started
- **Why**: `.task`-Format-Kompatibilitaet mit `@mediapipe/tasks-genai@0.10.27` ist nicht verifiziert. Risiko: Format-Mismatch blockiert Download → Load-Flow.
- **Constraints**: Test muss auf echtem Browser laufen (Desktop Chrome + Android), nicht nur unit.
- **Approach**: `pnpm dev` → Modell herunterladen, erste Prompt absenden, Streaming verifizieren. Falls Format nicht passt: `.litertlm` statt `.task` ausprobieren.
- **Acceptance criteria**: E2B und E4B laden ohne Error, beide streamen Tokens, Reload nutzt OPFS-Cache.

## Medium

### AG-UI-Protocol-Layer

- **Status**: Not started
- **Why**: Zukunftsfaehigkeit fuer Multi-Agent-Szenarien; Deutschland-Stack listet AG-UI (sandbox) fuer OER-Kontext.
- **Constraints**: In-Process-Agent bleibt Default, AG-UI ist additive Schicht.
- **Approach**: `AbstractAgent`-Subclass `LocalGemmaAgent` die via RxJS Observable die MediaPipe-Generator-Chunks als `TEXT_MESSAGE_CONTENT`-Events emittet. `useLlmRuntime` bleibt Alternative; User kann zwischen Modi wechseln.
- **Acceptance criteria**: Gleiche Conversations funktionieren mit AG-UI-Runtime UND External-Store-Runtime; Switch ueber Config-Flag.

### MCP-Tool-Use

- **Status**: Not started
- **Why**: Agent-Capabilities ueber reinen Chat hinaus (Web-Fetch, Calculator, Local-Tools).
- **Constraints**: Gemma 4 muss Function-Calling zuverlaessig unterstuetzen; nur public MCP-Server (keine Auth im MVP).
- **Approach**: `@modelcontextprotocol/sdk` Client im Browser, Tool-Definitionen in Prompt einflechten, Tool-Calls aus Modell-Output parsen und an MCP-Server dispatchen.
- **Acceptance criteria**: Mindestens ein Test-Tool (Calculator) funktioniert end-to-end; Error-Handling bei Tool-Fehler.

### RAG mit `@mediapipe/tasks-text` Embeddings

- **Status**: Not started
- **Why**: Lokaler Kontext-Injection (Dokumente, Notes) ohne Cloud-Abhaengigkeit.
- **Constraints**: Alles im Browser, kein Server. Embedding-Index muss in IndexedDB passen.
- **Approach**: `TextEmbedder` via MediaPipe, Embeddings in IndexedDB mit Cosine-Similarity-Suche (kein dedicated Vector-DB im Browser).
- **Acceptance criteria**: 100-Dokumente-Index, Query < 200 ms p95, relevante Chunks werden in Prompt injected.

### i18n (DE/EN)

- **Status**: Done (2026-04-24)
- **Why**: Scaffold wird fuer verschiedene Kunden genutzt, deutsche UI ist Default aber EN muss Option sein.
- **Approach**: Custom `useT()` ohne Framework (~40 LOC), String-Keys in `src/lib/i18n/{de,en}.ts`, Language-Detector via `navigator.language`, UI-Override in Settings-Dialog.
- **Outcome**: Alle User-facing Strings via `t()`, System-Sprache auto-detect, manueller Override in Settings (`auto` | `de` | `en`). Siehe DEC-007.

## Low

### Persona-Presets

- **Status**: Not started
- **Why**: Wiederkehrende System-Prompts (Assistent, Coder, Kreativ-Schreiber) ohne jedes Mal manuell einzutippen.
- **Approach**: Eigene Dexie-Tabelle + UI-Picker in Conversation-Settings.
- **Acceptance criteria**: Mindestens 3 Presets, per-Conversation-Auswahl, eigene Personas speicherbar.

### Voice-I/O

- **Status**: Not started
- **Why**: Accessibility + Mobile-UX.
- **Approach**: Web-Speech-API fuer Input (STT), TTS ueber `SpeechSynthesis`. Optional on-device Whisper fuer bessere Qualitaet.
- **Acceptance criteria**: Push-to-talk im Composer, TTS-Button auf Assistant-Bubbles.

### Export/Import Conversations (Markdown/JSON)

- **Status**: Not started
- **Why**: Backup + Sharing.
- **Approach**: Download-Button pro Conversation → Markdown mit Metadaten im Frontmatter. Import-Button liest die Struktur zurueck.
- **Acceptance criteria**: Round-Trip Export→Import erhaelt Message-IDs, Timestamps, Roles.

### Yesterday Corporate Theming

- **Status**: Not started
- **Why**: Wenn als Scaffold graduiert, sollte Projekt-spezifisches Branding einfach anpassbar sein.
- **Approach**: CSS-Variablen in `@theme` (statt harter Tailwind-Klassen fuer Brand-Farben), Theming-Doc in CONTRIBUTING.
- **Acceptance criteria**: Drei ENV-Variablen oder Config-Block andern reicht fuer Rebrand, keine Component-Edits.

### Playwright-E2E-Tests

- **Status**: Not started
- **Why**: Regression-Sicherheit vor Prod-Deployment.
- **Constraints**: Modell-Download kann in CI nicht 2 GB ziehen → Mock-LLM-Adapter fuer Tests.
- **Approach**: `@playwright/test`, Mock-Adapter der vordefinierte Tokens yields, Test-Scenarios: Download-Flow, Chat-Send, Conversation-Switch.
- **Acceptance criteria**: Mindestens 5 Scenarios gruen, < 30 s total.

### Alternative Modelle (Qwen, DeepSeek)

- **Status**: Not started
- **Why**: Nicht alle Use-Cases passen zu Gemma; mehrsprachige Kunden wollen evtl. Qwen.
- **Approach**: Sobald `litert-community` andere Modelle in `.task`-Format anbietet, `MODEL_CATALOG` erweitern.
- **Acceptance criteria**: Mindestens ein non-Gemma-Modell waehlbar, Prompt-Template-Abstraktion beherrscht beide Formate.

### `<input type=file>` Offline-Model-Loading

- **Status**: Not started
- **Why**: Kiosk / Air-Gapped / Firmen-Firewalls die HF blocken.
- **Approach**: File-Picker im Download-UI, akzeptiert `.task`-Files direkt, speichert in OPFS unter bekanntem Key.
- **Acceptance criteria**: Drag-n-Drop oder File-Picker laedt lokales Modell, rest des Flows identisch.

### Cloudflare R2 Mirror

- **Status**: Not started
- **Why**: HF-Hub-Unabhaengigkeit, eigene Control ueber Bandbreite.
- **Constraints**: Budget fuer R2-Storage (~EUR 1/Monat), eigene Domain.
- **Approach**: R2-Bucket mit Public-Read, Model-Files spiegeln, `MODEL_CATALOG` um alternative `repo`/`url`-Quelle erweitern.
- **Acceptance criteria**: Download-Quelle ueber Env-Variable umschaltbar, kein Code-Change fuer R2-Switch.
