import type { Dict } from "./types.ts";

export const en: Dict = {
  // Header
  "header.ready": "ready",
  "header.notReady": "not loaded",
  "header.cached": "cached",
  "header.drawer": "Conversations",
  "header.settings": "Settings",
  "header.swapModel": "Switch model",
  "header.swapModelShort": "Model",

  // Landing hero
  "hero.headline": "An LLM that doesn't phone home.",

  // Landing key facts
  "facts.backend.value": "0",
  "facts.backend.label": "Server Calls",
  "facts.local.value": "100%",
  "facts.local.label": "Browser-local",
  "facts.license.value": "Apache 2.0",
  "facts.license.label": "Open Source",

  // Model picker
  "picker.label": "Model",
  "picker.badge.cached": "cached",
  "picker.badge.download": "Download",
  "picker.description.E2B": "Fast · 2.6 GB · ~4 GB RAM",
  "picker.description.E4B": "Smarter · 5 GB · ~8 GB RAM",

  // Capabilities warnings
  "caps.notEnoughRam": "Device reports {deviceGB} GB RAM, ≥{minGB} GB recommended.",
  "caps.ramCritical": "Not enough RAM — will crash.",
  "caps.notEnoughStorage": "Not enough browser storage (free {freeGB}, need ~{needGB}).",
  "caps.noWebgpu": "No WebGPU — inference runs on CPU/WASM, much slower.",
  "caps.saveData": "Data Saver is on — the large download still comes.",
  "caps.slowConnection": "Slow connection ({type}) — download of {sizeGB} will take a while.",
  "caps.iosMemoryCap":
    "iPhone/iPad: the WKWebView tab memory limit (~800 MB) silently kills downloads of this size. Use a desktop browser.",

  // Download progress
  "download.subtitle": "Gemma 4 · MediaPipe · browser-local",
  "download.loadButton": "Load model",
  "download.cancel": "Cancel",
  "download.retry": "Retry",
  "download.phase.checkingCache": "Checking cache …",
  "download.phase.downloading": "Downloading",
  "download.phase.cached": "Cached",
  "download.phase.initializing": "Inference engine starting …",
  "download.initHint":
    "First start takes 10–25 s (WebGPU shader compile). After that, the browser cache kicks in.",
  "download.initPhase.0": "reading model from cache",
  "download.initPhase.1": "compiling webgpu shaders",
  "download.initPhase.2": "uploading tensors to gpu",
  "download.initPhase.3": "initializing kv-cache",
  "download.initPhase.4": "ready in a moment",
  "download.error.quota":
    "Not enough browser cache space (available {availableBytes}, need {requiredBytes})",
  "download.error.http": "Download failed: HTTP {status}",

  // Chat thread
  "chat.empty": "Start with a message.",
  "chat.placeholder": "Ask something …",
  "chat.placeholderDisabled": "Model not ready …",
  "chat.send": "Send",
  "chat.cancel": "Cancel",
  "chat.gen.0": "thinking",
  "chat.gen.1": "composing",
  "chat.gen.2": "generating tokens",

  // Conversation sidebar
  "sidebar.newThread": "New conversation",
  "sidebar.delete": "Delete",
  "sidebar.fallbackTitle": "New conversation",

  // Install prompt
  "install.question": "Install the app for offline use?",
  "install.button": "Install",
  "install.dismiss": "Dismiss",

  // Offline indicator
  "offline.badge": "offline",

  // Stats footer tooltips
  "stats.ttft": "Time to first token",
  "stats.duration": "Total generation time",
  "stats.tokens": "Output tokens",
  "stats.tokensPerSecond": "Tokens per second (decode rate)",

  // Settings dialog
  "settings.title": "Settings",
  "settings.close": "Close",
  "settings.maxTokens.label": "Context window · Max {max}",
  "settings.maxTokens.hint":
    "Combined input + output tokens. Gemma 4 supports up to {max} — larger = more GPU RAM + slower. Default for {model}: {current}.",
  "settings.temperature.label": "Temperature",
  "settings.temperature.hint": "0.0 = deterministic · 0.7 = chat · 1.0 = creative · 2.0 = chaotic",
  "settings.topK.label": "Top-K",
  "settings.topK.hint": "Number of candidate tokens per step. Smaller = more focused.",
  "settings.systemPrompt.label": "System prompt",
  "settings.systemPrompt.placeholder": "Leave empty for no system prompt",
  "settings.systemPrompt.hint": "Applies from the next turn — no model reload needed.",
  "settings.locale.label": "Language",
  "settings.locale.auto": "System",
  "settings.reloadHint":
    'Sampling and context changes only apply after model reload (button "Model" top right).',
  "settings.reset": "Defaults",
  "settings.cancel": "Cancel",
  "settings.save": "Save",

  // System prompt default
  "systemPrompt.default": [
    "You are an AI assistant. Rules:",
    "- Answer concisely and directly.",
    "- Don't greet on every reply.",
    "- Don't repeat stock phrases like 'How can I help you?'.",
    "- Answer in the user's language.",
    "- For unclear questions, ask a short clarifier instead of speculating.",
    "- Use the full conversation context, not just the last message.",
  ].join("\n"),
};
