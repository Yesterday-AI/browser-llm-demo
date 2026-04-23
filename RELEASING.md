# Release & Deployment Runbook

End-to-end procedure for shipping `browser-llm-demo` to GitHub Pages.

## Prerequisites

- Fork / own the repo under an org or user (e.g. `yesterday-ai/browser-llm-demo`)
- `gh` CLI authenticated (or web access to repo Settings)
- Local: `pnpm install && pnpm lint && pnpm typecheck && pnpm build` — all green

## First-time Repo Setup

### 1. Verify branding constants

```
# src/lib/project.ts
name: "browser-llm-demo"
displayName: "browser-llm"
githubUrl: "https://github.com/<org>/<repo>"
basePath: "/<repo>/"
```

### 2. Match `package.json`

- `name`, `repository.url`, `homepage`, `bugs.url` all point at the same `<org>/<repo>`.

### 3. Replace icons + branding (optional)

- `public/icons/icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`

### 4. Push to GitHub

```bash
git init
git add .
git commit -m "chore: initial scaffold release (v0.1.0)"
gh repo create <org>/browser-llm-demo --public --source=. --push
```

### 5. Enable GitHub Pages

- GitHub → repo → Settings → Pages
- Source: **GitHub Actions**
- Custom domain: (optional)

### 6. First deploy

The workflow runs automatically on every push to `main`. Watch it in the Actions tab.

```bash
# or trigger manually:
gh workflow run deploy.yml
```

Live URL: `https://<org>.github.io/browser-llm-demo/`

## On first visit (expected behaviour)

1. Browser loads `index.html` with `<script src="/.../coi-serviceworker.js">`
2. Service worker registers, page reloads once (SW install handshake)
3. SW injects `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` on all subsequent responses
4. `window.crossOriginIsolated === true` → MediaPipe threaded WASM works
5. User picks model → HF download → OPFS cache → WebGPU init → chat

## Subsequent releases

```bash
# bump version
pnpm version patch   # or minor / major

# update CHANGELOG.md (add a new [x.y.z] block above [0.1.0])

git push && git push --tags
```

GitHub Action rebuilds and redeploys. Users' cached model stays in their OPFS, their conversations stay in IndexedDB.

## Repo description + topics

**Description (max 350 chars):**

> Scaffold for browser-local LLM chat apps. Runs Gemma 4 entirely in the browser via MediaPipe + WebGPU — no server, no cloud, no tokens. Mobile-first PWA, Atomic Design, i18n (DE/EN), multi-conversation, Apache 2.0. Fork it to build your privacy-first AI app.

**Topics / tags** (paste in GitHub Settings → About):

- `typescript`
- `react`
- `vite`
- `pwa`
- `gemma`
- `mediapipe`
- `llm`
- `browser-llm`
- `offline-first`
- `webgpu`
- `privacy`
- `scaffold`

**Website**: `https://<org>.github.io/browser-llm-demo/`

## Troubleshooting

### `crossOriginIsolated === false` after first visit

- Hard-reload (Cmd/Ctrl+Shift+R) to clear potentially-broken SW state
- Check `coi-serviceworker.js` actually served (DevTools → Network)
- Some browsers (Safari ITP) unregister SWs after 7 inactive days — visit the page to refresh

### 404 on subpaths after deploy

- `PROJECT.basePath` in `src/lib/project.ts` must match `/<repo>/`
- Otherwise assets get requested at wrong path

### Model download fails

- Hugging Face might rate-limit on heavy traffic — retry, or set up an own R2 mirror (see ROADMAP)

### WASM doesn't load

- DevTools → Network → filter `wasm` — should be 200 from `/wasm/genai_wasm_*.wasm`
- If 404: `pnpm build` didn't run `predev`/`prebuild` script that copies from `node_modules`

### Icons don't show in install-prompt

- Manifest `start_url` must match base path
- PNG files must exist in `dist/icons/`
- Lighthouse PWA audit will show the exact reason
