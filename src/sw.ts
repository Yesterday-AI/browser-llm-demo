import { ExpirationPlugin } from "workbox-expiration";
/// <reference lib="webworker" />
/**
 * Service Worker — combines Workbox precache/runtime-cache with client-side
 * COOP/COEP header injection.
 *
 * Why combined: GitHub Pages does not allow custom response headers, but
 * MediaPipe's threaded WASM needs `Cross-Origin-Opener-Policy: same-origin`
 * + `Cross-Origin-Embedder-Policy: require-corp` for SharedArrayBuffer.
 * The well-known `coi-serviceworker` trick injects those headers client-side
 * — but registering it alongside vite-plugin-pwa's generated Workbox SW
 * causes a scope conflict (last-registered wins). Merge both here.
 *
 * COI header logic lifted from gzuidhof/coi-serviceworker (MIT).
 */
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, setDefaultHandler } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

cleanupOutdatedCaches();

// Wrap any Response with COOP/COEP/CORP headers so crossOriginIsolated can be true.
async function withCoiHeaders(response: Response | undefined): Promise<Response | undefined> {
  if (!response || response.status === 0) return response;
  const headers = new Headers(response.headers);
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Workbox plugin that applies COI headers to every response — whether it
// came fresh from the network or was pulled from the runtime cache.
const coiPlugin = {
  fetchDidSucceed: async ({ response }: { response: Response }) => {
    const wrapped = await withCoiHeaders(response);
    return wrapped ?? response;
  },
  cachedResponseWillBeUsed: async ({ cachedResponse }: { cachedResponse?: Response }) => {
    if (!cachedResponse) return null;
    const wrapped = await withCoiHeaders(cachedResponse);
    return wrapped ?? cachedResponse;
  },
};

// Precache app shell (HTML, JS, CSS, icons, manifest).
// `self.__WB_MANIFEST` is the list injected at build time by vite-plugin-pwa.
precacheAndRoute(self.__WB_MANIFEST);

// MediaPipe WASM — immutable per deploy, cache aggressively.
registerRoute(
  /\/wasm\/[^?#]+\.(wasm|js)$/,
  new CacheFirst({
    cacheName: "mediapipe-wasm",
    plugins: [coiPlugin, new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 90 })],
  }),
);

// Hugging Face model downloads bypass the SW entirely — they're huge and
// already go into OPFS via streaming fetch.
registerRoute(
  ({ url }) => url.origin === "https://huggingface.co",
  async ({ request }) => fetch(request),
);

// Everything else: network-first, COI headers attached.
setDefaultHandler(
  new NetworkFirst({
    cacheName: "app-shell",
    plugins: [coiPlugin],
  }),
);
