#!/usr/bin/env node
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "node_modules/@mediapipe/tasks-genai/wasm");
const DST = resolve(ROOT, "public/wasm");

const WASM_FILES = [
  "genai_wasm_internal.js",
  "genai_wasm_internal.wasm",
  "genai_wasm_module_internal.js",
  "genai_wasm_module_internal.wasm",
];

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.error(`[copy-wasm] Source not found: ${SRC}`);
    console.error("[copy-wasm] Run `pnpm install` first.");
    process.exit(1);
  }

  await mkdir(DST, { recursive: true });

  const available = new Set(await readdir(SRC));
  const targets = WASM_FILES.filter((f) => available.has(f));

  if (targets.length === 0) {
    console.error(`[copy-wasm] No known WASM files in ${SRC}`);
    console.error(`[copy-wasm] Available: ${[...available].join(", ")}`);
    process.exit(1);
  }

  for (const f of targets) {
    const src = join(SRC, f);
    const dst = join(DST, f);
    await copyFile(src, dst);
    const s = await stat(dst);
    console.log(`[copy-wasm] ${f} (${(s.size / 1024 / 1024).toFixed(1)} MB)`);
  }
  console.log(`[copy-wasm] Done → ${DST}`);
}

main().catch((err) => {
  console.error("[copy-wasm]", err);
  process.exit(1);
});
