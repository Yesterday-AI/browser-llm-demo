export const de = {
  // Header
  "header.ready": "bereit",
  "header.notReady": "nicht geladen",
  "header.cached": "cached",
  "header.drawer": "Gespraeche",
  "header.settings": "Einstellungen",
  "header.swapModel": "Modell wechseln",
  "header.swapModelShort": "Modell",

  // Landing hero
  "hero.headline": "Ein LLM, das nicht nach Hause telefoniert.",

  // Landing key facts
  "facts.backend.value": "0",
  "facts.backend.label": "Server-Calls",
  "facts.local.value": "100 %",
  "facts.local.label": "Browser-lokal",
  "facts.license.value": "Apache 2.0",
  "facts.license.label": "Open-Source",

  // Model picker
  "picker.label": "Modell",
  "picker.badge.cached": "im Cache",
  "picker.badge.download": "Download",
  "picker.description.E2B": "Schnell · 2.6 GB · ~4 GB RAM",
  "picker.description.E4B": "Klueger · 5 GB · ~8 GB RAM",

  // Capabilities warnings
  "caps.notEnoughRam": "Geraet meldet {deviceGB} GB RAM, empfohlen ≥{minGB} GB.",
  "caps.ramCritical": "Nicht genug RAM — wird abstuerzen.",
  "caps.notEnoughStorage": "Nicht genug Browser-Speicher (frei {freeGB}, benoetigt ~{needGB}).",
  "caps.noWebgpu": "Keine WebGPU — Inferenz laeuft auf CPU/WASM, deutlich langsamer.",
  "caps.saveData": "Data-Saver aktiv — grosser Download kommt trotzdem.",
  "caps.slowConnection": "Langsame Verbindung ({type}) — Download von {sizeGB} dauert lange.",

  // Download progress
  "download.subtitle": "Gemma 4 · MediaPipe · browser-lokal",
  "download.loadButton": "Modell laden",
  "download.cancel": "Abbrechen",
  "download.retry": "Erneut versuchen",
  "download.phase.checkingCache": "Cache pruefen …",
  "download.phase.downloading": "Download laeuft",
  "download.phase.cached": "Im Cache",
  "download.phase.initializing": "Inferenz-Engine startet …",
  "download.initHint":
    "Erstmaliger Start dauert 10–25 s (WebGPU-Shader-Compile). Danach greift der Browser-Cache.",
  "download.initPhase.0": "lese modell aus cache",
  "download.initPhase.1": "kompiliere webgpu-shader",
  "download.initPhase.2": "lade tensoren auf gpu",
  "download.initPhase.3": "initialisiere kv-cache",
  "download.initPhase.4": "bereit in kuerze",
  "download.error.quota":
    "Nicht genug Speicher im Browser-Cache (verfuegbar {availableBytes}, benoetigt {requiredBytes})",
  "download.error.http": "Download fehlgeschlagen: HTTP {status}",

  // Chat thread
  "chat.empty": "Starte mit einer Nachricht.",
  "chat.placeholder": "Frag etwas …",
  "chat.placeholderDisabled": "Modell nicht bereit …",
  "chat.send": "Senden",
  "chat.cancel": "Abbrechen",
  "chat.gen.0": "denke nach",
  "chat.gen.1": "formuliere",
  "chat.gen.2": "generiere tokens",

  // Conversation sidebar
  "sidebar.newThread": "Neues Gespraech",
  "sidebar.delete": "Loeschen",
  "sidebar.fallbackTitle": "Neues Gespraech",

  // Install prompt
  "install.question": "App installieren fuer Offline-Nutzung?",
  "install.button": "Installieren",
  "install.dismiss": "Schliessen",

  // Offline indicator
  "offline.badge": "offline",

  // Stats footer tooltips
  "stats.ttft": "Time-to-first-token",
  "stats.duration": "Gesamt-Generationsdauer",
  "stats.tokens": "Output-Tokens",
  "stats.tokensPerSecond": "Tokens pro Sekunde (Decode-Rate)",

  // Settings dialog
  "settings.title": "Einstellungen",
  "settings.close": "Schliessen",
  "settings.maxTokens.label": "Kontext-Fenster · Max {max}",
  "settings.maxTokens.hint":
    "Combined Input + Output Tokens. Gemma 4 unterstuetzt bis {max} — groesser = mehr GPU-RAM + langsamer. Default fuer {model}: {current}.",
  "settings.temperature.label": "Temperature",
  "settings.temperature.hint":
    "0.0 = deterministisch · 0.7 = Chat · 1.0 = kreativ · 2.0 = chaotisch",
  "settings.topK.label": "Top-K",
  "settings.topK.hint": "Anzahl Kandidaten-Tokens pro Step. Kleiner = fokussierter.",
  "settings.systemPrompt.label": "System-Prompt",
  "settings.systemPrompt.placeholder": "Leer lassen fuer keinen System-Prompt",
  "settings.systemPrompt.hint": "Gilt ab dem naechsten Turn — kein Modell-Reload noetig.",
  "settings.locale.label": "Sprache",
  "settings.locale.auto": "System",
  "settings.reloadHint":
    'Sampling- und Kontext-Aenderungen greifen erst nach Modell-Reload (Button „Modell" oben rechts).',
  "settings.reset": "Defaults",
  "settings.cancel": "Abbrechen",
  "settings.save": "Speichern",

  // System prompt default
  "systemPrompt.default": [
    "Du bist ein KI-Assistent. Beachte:",
    "- Antworte knapp und direkt.",
    "- Begruesse nicht bei jeder Antwort erneut.",
    "- Wiederhole keine Standard-Floskeln wie 'Wie kann ich dir helfen?'.",
    "- Antworte in der Sprache des Nutzers.",
    "- Bei unklaren Fragen frage kurz nach statt zu spekulieren.",
    "- Nutze den gesamten Konversationskontext, nicht nur die letzte Nachricht.",
  ].join("\n"),
} as const;
