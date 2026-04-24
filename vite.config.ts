import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { type Plugin, defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { PROJECT } from "./src/lib/project.ts";

// MediaPipe ships `.mjs` bundles with a `sourceMappingURL` comment but no `.map` file.
// Vite reads the raw file for sourcemap extraction BEFORE the transform hook runs, so
// a transform-time strip is too late. The `load` hook returns pre-stripped content.
const stripMediapipeSourcemap = (): Plugin => ({
  name: "strip-mediapipe-sourcemap",
  enforce: "pre",
  async load(id) {
    const clean = id.split("?")[0];
    if (!clean.includes("@mediapipe/tasks-genai")) return null;
    if (!/\.m?js$/.test(clean)) return null;
    const { readFile } = await import("node:fs/promises");
    try {
      const raw = await readFile(clean, "utf-8");
      return { code: raw.replace(/\/\/# sourceMappingURL=.*$/gm, ""), map: null };
    } catch {
      return null;
    }
  },
});

export default defineConfig(({ command }) => ({
  // Dev at "/", prod at PROJECT.basePath ("/client-ai/" for GitHub Pages project site).
  base: command === "build" ? PROJECT.basePath : "/",
  plugins: [
    stripMediapipeSourcemap(),
    react(),
    tailwindcss(),
    VitePWA({
      // Custom SW that combines precache + COOP/COEP header injection.
      // Required for SharedArrayBuffer on hosts without custom headers
      // (GitHub Pages). See src/sw.ts for the full rationale.
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      // Prompt on update instead of reloading silently — a silent reload
      // during a failed multi-GB download looks identical to a crash on iOS.
      registerType: "prompt",
      injectRegister: "auto",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      manifest: {
        name: PROJECT.name,
        short_name: PROJECT.name,
        description: "Browser-local LLM chat with Gemma 4",
        start_url: PROJECT.basePath,
        scope: PROJECT.basePath,
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          { src: "icons/icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ["@mediapipe/tasks-genai"],
  },
}));
