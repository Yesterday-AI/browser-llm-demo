// Prepend Vite's runtime base URL (dev = "/", prod = PROJECT.basePath e.g.
// "/browser-llm-demo/") to a relative asset path. Needed for JS-land refs
// to public/ assets since Vite only rewrites absolute paths in index.html.
export function assetPath(relative: string): string {
  const base = import.meta.env.BASE_URL;
  return base + relative.replace(/^\/+/, "");
}
