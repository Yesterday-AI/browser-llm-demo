import type { Locale } from "./i18n/index.ts";

// Trockene Privacy-first Taglines, rotieren zufaellig beim Landing.
// Stil: OpenClaw CLI / Fleet Manager — knapp, selbstironisch, ohne Marketing-Sosse.
// Bewusst modell-agnostisch damit Scaffold-Forks (Qwen/DeepSeek/Llama/...) ohne
// Tagline-Edit lauffaehig bleiben.

const TAGLINES_DE: readonly string[] = [
  "Dein Tab. Deine GPU. Deine Regeln.",
  "Kein Cloud, kein Token, kein Problem.",
  "Keine API-Keys. Keine Telemetrie. Keine Ausreden.",
  "Sagst du nix, weiss es niemand. Selbst wir nicht.",
  "Der Server ist dein Browser.",
  "Airplane-Mode ist hier der Normal-Modus.",
  "Prompts bleiben wo sie hingehoeren: nirgends.",
  "100 % GPU, 0 % Traffic.",
  "DSGVO-konform aus reiner Faulheit — wir sehen eh nix.",
  "Weights im Browser, Weisheit hoffentlich auch.",
  "Das Modell ist Gast in deiner Hardware.",
  "Kein /api/chat. Kein Logfile. Keine Spur.",
  "Latenz = Lichtgeschwindigkeit bis zum RAM.",
  "Lokal, weil Remote uns zu anstrengend war.",
  "Ihre Daten verlassen diesen Tab ungern.",
  "Ein Modell, deine Hardware, null Pings.",
  "Funktioniert auch im Bunker.",
  "Dein ISP sieht nur den Download. Danach: Funkstille.",
  "Fork it. Own it. Ship it.",
  "Open-Source. Closed-Network.",
];

const TAGLINES_EN: readonly string[] = [
  "Your tab. Your GPU. Your rules.",
  "No cloud, no token, no problem.",
  "No API keys. No telemetry. No excuses.",
  "Say nothing, no one knows. Not even us.",
  "The server is your browser.",
  "Airplane mode is the default mode.",
  "Prompts stay where they belong: nowhere.",
  "100% GPU, 0% traffic.",
  "GDPR-compliant out of pure laziness — we can't see anything anyway.",
  "Weights in the browser. Wisdom hopefully too.",
  "The model is your hardware's guest.",
  "No /api/chat. No log file. No trail.",
  "Latency = speed of light to RAM.",
  "Local, because remote was too much effort.",
  "Your data reluctantly leaves this tab.",
  "One model, your hardware, zero pings.",
  "Works in a bunker too.",
  "Your ISP sees the download. After that: radio silence.",
  "Fork it. Own it. Ship it.",
  "Open source. Closed network.",
];

export function pickTagline(locale: Locale, seed?: number): string {
  const list = locale === "en" ? TAGLINES_EN : TAGLINES_DE;
  const idx =
    seed !== undefined ? Math.abs(seed) % list.length : Math.floor(Math.random() * list.length);
  return list[idx] ?? list[0];
}
