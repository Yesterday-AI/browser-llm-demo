# Decision Log

Architekturelle Entscheidungen fuer `browser-llm-demo`. Jede Entscheidung hat Status, Datum, Owner, Rationale.
Neue Entscheidungen starten als `proposed` und werden vom Owner auf `accepted` gesetzt.

---

## DEC-001: MediaPipe `tasks-genai` als Browser-LLM-Runtime

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: Wir nutzen `@mediapipe/tasks-genai` (Google LiteRT WASM) fuer browser-lokale Gemma-4-Inferenz.
- **Rationale**: Einzige produktionsreife Browser-Runtime mit offiziellem Gemma-4-Support (via `litert-community` Mirror). WebLLM (MLC) laueft nur mit eigener Model-Konvertierung, `transformers.js` hat fuer Gemma 4 noch keinen Pfad. MediaPipe liefert WebGPU-Beschleunigung + WASM-Fallback out of the box.
- **Affected modules**:
  - `src/lib/mediapipe-llm.ts`
  - `scripts/copy-wasm.mjs`
  - `vite.config.ts` (COOP/COEP-Header + WASM runtime cache)

---

## DEC-002: Direct HF-Download + OPFS-Cache (kein Auth, kein Mirror)

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: Modelle werden per plain `fetch()` direkt von `huggingface.co/litert-community/*` geladen und in OPFS gecached.
- **Rationale**: `litert-community`-Modelle sind public + ungated + Apache-2.0 — kein Token noetig. `@huggingface/hub` wie im Upstream-Sample bringt OAuth-Overhead fuer einen Fall den wir nicht haben. OPFS ist die einzige Browser-Storage-API mit File-Handle-Semantik fuer Multi-GB-Daten. Eigener Mirror (R2/MinIO) kommt nur wenn HF-SPOF-Risiko relevant wird (Roadmap).
- **Affected modules**:
  - `src/lib/opfs-cache.ts`
  - `src/lib/model-catalog.ts`

---

## DEC-003: `useExternalStoreRuntime` (nicht `useLocalRuntime`)

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: assistant-ui wird via `useExternalStoreRuntime` angebunden, Messages leben in Zustand + Dexie.
- **Rationale**: `useLocalRuntime` haelt genau einen Thread in-memory. Fuer Multi-Conversation mit Persistenz muessen wir die Messages selbst halten — der External-Store-Adapter gibt uns gleichzeitig den `threadList`-Hook, der `ThreadListPrimitive` in der Sidebar direkt versorgt.
- **Affected modules**:
  - `src/hooks/useLlmRuntime.ts`
  - `src/lib/chat-store.ts`
  - `src/lib/db.ts`
  - `src/components/organisms/ConversationSidebar.tsx`

---

## DEC-004: Atomic Design Folder Structure

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: Components sind nach Brad Frosts Atomic Design strukturiert: `atoms/ molecules/ organisms/ templates/ pages/`.
- **Rationale**: Klare Dependency-Grenzen (Atoms kennen keine Domain, Organisms duerfen Stores ziehen) vereinfachen Scaffold-Reuse. Alternative "flat components/" ging auf 7+ Files ohne offensichtliche Rangfolge.
- **Affected modules**:
  - `src/components/{atoms,molecules,organisms,templates,pages}/`

---

## DEC-005: Dark-Theme-Only fuer MVP

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: Die App rendert ausschliesslich im Dark-Theme. Keine `dark:`-Tailwind-Varianten, kein `prefers-color-scheme: light`-Branch.
- **Rationale**: Initial wurde Dual-Theme versucht, aber Tailwinds `dark:`-Prefix und die Body-CSS-Media-Query kollidierten (heller Background + heller Text in Dark-Mode = unsichtbare Cards). Dark-only eliminiert die Bug-Klasse komplett, reduziert Class-Noise, passt zum Brand. Light-Mode ist Roadmap.
- **Affected modules**:
  - `src/styles.css`
  - Alle `src/components/**`

---

## DEC-006: Vite 6 + `vite-plugin-pwa` (nicht Next.js)

- **Status**: accepted
- **Date**: 2026-04-23
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: Build-Stack ist Vite + vite-plugin-pwa. Kein SSR-Framework.
- **Rationale**: App ist 100 % client-side (LLM laeuft im Browser). SSR waere toter Overhead. Vite liefert minimalen Bundle (518 KB), PWA-Plugin ist ausgereift, COOP/COEP-Headers easy zu setzen. Yesterday-Standard-Stack.
- **Affected modules**:
  - `vite.config.ts`
  - `package.json`

---

## DEC-007: Lean i18n ohne react-i18next

- **Status**: accepted
- **Date**: 2026-04-24
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: Eigenes typed `useT()` + zwei flat dictionaries (`de.ts`, `en.ts`) statt react-i18next / FormatJS.
- **Rationale**: Ein Chat-Prototyp hat ~70 Strings — react-i18next (30+ KB) ist Overkill. Unsere Implementation ist ~40 Zeilen: `translate(locale, key, vars)` + `useT()`-Hook + auto-locale via `navigator.language`. TypeScript-Key-Validierung aus `keyof typeof de`. Scaffold-Fork-Friendly: neue Sprache = neue Datei, kein Runtime-Framework-Wissen.
- **Affected modules**:
  - `src/lib/i18n/{de,en,types,index}.ts`
  - `src/lib/taglines.ts`
  - `src/components/**` (alle user-facing Components)

---

## DEC-008: GitHub Pages + coi-serviceworker (nicht Cloudflare)

- **Status**: accepted
- **Date**: 2026-04-24
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: Deploy via GitHub Pages, COOP/COEP-Header werden client-side von `coi-serviceworker.js` injected.
- **Rationale**: MediaPipe braucht `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` fuer SharedArrayBuffer (threaded WASM). GitHub Pages unterstuetzt keine Custom-Header. Cloudflare Pages waere technisch einfacher (nativer `_headers`-Support), widerspricht aber dem "free + open"-Gedanken dieses Scaffolds. `coi-serviceworker` (gzuidhof, MIT, 2 KB) registriert einen SW der beim ersten Visit die Page einmal reloaded und dann COOP/COEP-Header lokal hinzufuegt. Standard-Pattern in der Browser-LLM-Szene.
- **Affected modules**:
  - `public/coi-serviceworker.js`
  - `index.html`
  - `.github/workflows/deploy.yml`
  - `vite.config.ts` (`base` + conditional PROJECT.basePath)

---

## DEC-009: User-editable Settings (maxTokens, sampling, system-prompt, locale)

- **Status**: accepted
- **Date**: 2026-04-24
- **Owner**: Yesterday Founder
- **Proposed-by**: Claude Code
- **Decision**: Settings-Dialog mit Persistenz in `localStorage`, Per-Model-Defaults in `MODEL_CATALOG`, User-Override per Slider.
- **Rationale**: Initialer Default von `maxTokens: 1024` war zu knapp (Kontext-Fenster combined input+output); E2B schafft nativ bis 128K. Aber KV-Cache skaliert linear = GPU-RAM-Impact. Per-Model Default (E2B: 32K, E4B: 16K) + User-override bis MODEL_MAX_TOKENS (128K). Gleiche Logik fuer temperature (0.7) und topK (40) — Google-Empfehlung (1.0/64) war zu kreativ fuer Chat. System-Prompt: `null` = i18n-Default, `""` = keiner, String = custom. Locale: `auto` | `de` | `en`.
- **Affected modules**:
  - `src/lib/settings-store.ts`
  - `src/lib/model-catalog.ts` (per-model `maxTokens` + `MODEL_MAX_TOKENS`)
  - `src/components/organisms/SettingsDialog.tsx`
  - `src/components/molecules/SliderField.tsx`
  - `src/lib/llm-store.ts` (reads settings at load time)
  - `src/lib/chat-store.ts` (reads locale + systemPrompt at turn time)

---

## Template fuer neue Entscheidungen

```markdown
## DEC-00X: <Titel>

- **Status**: proposed | accepted | superseded
- **Date**: YYYY-MM-DD
- **Owner**: Yesterday Founder
- **Proposed-by**: <agent-or-human>
- **Decision**: <ein Satz>
- **Rationale**: <warum das statt Alternativen>
- **Supersedes**: DEC-00Y (optional)
- **Affected modules**:
    - `src/...`
```
