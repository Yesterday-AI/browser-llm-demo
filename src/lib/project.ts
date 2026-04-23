// Project-level identity constants. Scaffold-clones override here, nicht in
// Env-Variablen — diese Werte sind Deploy-invariant fuer einen Fork.

export const PROJECT = {
  // npm + repo name + manifest identifier (kebab-case, long form).
  name: "browser-llm-demo",
  // Short label shown in the Header. Keep compact — long scaffold names
  // eat mobile layout. Scaffold-forks set this to their actual app name.
  displayName: "browser-llm",
  // Public GitHub repo. Set to null to hide the icon on the landing page.
  githubUrl: "https://github.com/yesterday-ai/browser-llm-demo" as string | null,
  // Base path for production builds (GitHub Pages project site: "/<repo>/").
  // Dev server always runs at "/". Empty string / "/" = root deployment.
  basePath: "/browser-llm-demo/",
} as const;
