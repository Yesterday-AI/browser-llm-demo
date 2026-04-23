# Contributing

Dieses Repo ist ein **Yesterday Browser-LLM-Scaffold**. Beitraege sind willkommen,
der Anspruch ist: jeder Commit haelt Typecheck, Lint und Build gruen.

## Dev-Setup

```bash
pnpm install
pnpm dev
```

Node 22, pnpm 10. Erster Model-Download ~2.6 GB — WLAN empfohlen.

## Workflow

1. Branch off `main`, kurze beschreibende Namen (`feat/model-picker-warnings`, `fix/ios-opfs-quota`)
2. Commits in Conventional-Commits-Form (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
3. Vor PR lokal: `pnpm lint && pnpm typecheck && pnpm build` — alle drei gruen
4. PR-Beschreibung folgt `.github/pull_request_template.md`
5. Bei nicht-trivialen Design-Aenderungen: neuer Eintrag in `DECISIONS.md` (Status `proposed`)

## Code-Standards

- **TypeScript strict** — keine `any`, keine `as`-Assertions ausser an Runtime-Grenzen
- **Biome** fuer Format + Lint — `pnpm format` vor commit. Kein ESLint/Prettier parallel.
- **Imports:** Barrel-Files in `atoms/molecules/organisms/` verwenden
- **Atomic Design Layering** — atoms kennen keine Domain, organisms koennen Stores ziehen. Siehe `src/components/` Struktur.
- **Keine Kommentare** die wiederholen was der Code sagt. Nur fuer non-obvious Constraints.

## Tests

Aktuell kein Test-Setup im MVP — Vitest + Playwright in der Roadmap.
Bis dahin: manuelles End-to-End per `pnpm dev` auf Desktop Chrome, Android Chrome (via `--host`) und iOS Safari.

## Dokumentations-Regel

- **AGENTS.md** bei Architektur-Aenderungen aktualisieren
- **CONTEXT.md** bei Modul-Verschiebungen
- **DECISIONS.md** bei non-trivialen Entscheidungen (Status: proposed → accepted)
- **ROADMAP.md** wenn Items Status wechseln
- **CHANGELOG.md** bei Releases (Keep-a-Changelog-Format)

## Issues

- Bug-Reports: Template in `.github/ISSUE_TEMPLATE/bug_report.md`
- Feature-Requests: Template in `.github/ISSUE_TEMPLATE/feature_request.md`

## Governance

- **Owner / Entscheidung**: Yesterday Founder
- **AI-Implementierung**: Claude Code

Entscheidungen > 1 Modul beruehrend brauchen einen DEC-xxx-Eintrag bevor sie gemergt werden.
