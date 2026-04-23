# Contributing

This repo is a **Yesterday browser-LLM scaffold**. Contributions are welcome.
The bar is simple: every commit keeps typecheck, lint, and build green.

## Dev setup

```bash
pnpm install
pnpm dev
```

Node 22, pnpm 10. First model download is ~2.6 GB — Wi-Fi recommended.

## Workflow

1. Branch off `main` with a short descriptive name (`feat/model-picker-warnings`, `fix/ios-opfs-quota`)
2. Commits in Conventional Commits format (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
3. Before opening a PR, locally: `pnpm lint && pnpm typecheck && pnpm build` — all three green
4. PR description follows `.github/pull_request_template.md`
5. For non-trivial design changes, add a `DECISIONS.md` entry with status `proposed`

## Code standards

- **TypeScript strict** — no `any`, no `as` assertions except at runtime boundaries
- **Biome** for format + lint — run `pnpm format` before commit. No ESLint/Prettier alongside.
- **Imports**: use the barrel files in `atoms/molecules/organisms/`
- **Atomic Design layering** — atoms know nothing about the domain; organisms may pull stores. See `src/components/`.
- **No comments** that restate what the code already says. Only for non-obvious constraints.

## Tests

No test suite yet in the MVP — Vitest + Playwright are on the roadmap.
Until then: manual end-to-end via `pnpm dev` on Desktop Chrome, Android Chrome (via `--host`), and iOS Safari.

## Documentation rule

- Update **AGENTS.md** on architecture changes
- Update **CONTEXT.md** when modules move
- Update **DECISIONS.md** on non-trivial decisions (status: proposed → accepted)
- Update **ROADMAP.md** when item status changes
- Update **CHANGELOG.md** on releases (Keep a Changelog format)

## Issues

- Bug reports: template in `.github/ISSUE_TEMPLATE/bug_report.md`
- Feature requests: template in `.github/ISSUE_TEMPLATE/feature_request.md`

## Governance

- **Owner / decision authority**: Yesterday founder
- **AI implementation**: Claude Code

Decisions that touch more than one module need a `DEC-xxx` entry before they merge.
