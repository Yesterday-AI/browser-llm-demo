// Project-level identity constants. Scaffold forks override these values here,
// not via env vars — they are deploy-invariant for a given fork.

export const PROJECT = {
  // npm + repo name + manifest identifier (kebab-case, long form).
  name: "browser-llm-demo",
  // Short label shown in the header. Keep it compact — long scaffold names
  // eat mobile layout. Forks override this to their actual app name.
  displayName: "browser-llm",
  // Public GitHub repo. Set to null to hide the icon on the landing page.
  githubUrl: "https://github.com/yesterday-ai/browser-llm-demo" as string | null,
  // Base path for production builds (GitHub Pages project site: "/<repo>/").
  // Dev server always runs at "/". Empty string / "/" = root deployment.
  basePath: "/browser-llm-demo/",
} as const;
