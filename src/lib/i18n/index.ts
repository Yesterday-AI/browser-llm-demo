import { useMemo } from "react";
import { useSettingsStore } from "../settings-store.ts";
import { de } from "./de.ts";
import { en } from "./en.ts";
import type { Dict, Locale, LocaleSetting, TranslationKey, Vars } from "./types.ts";

export type { Dict, Locale, LocaleSetting, TranslationKey, Vars };

export const LOCALES: readonly Locale[] = ["de", "en"];
export const LOCALE_LABELS: Record<Locale, string> = { de: "Deutsch", en: "English" };

const DICTS: Record<Locale, Dict> = { de, en };

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "de";
  const lang = navigator.language?.toLowerCase() ?? "";
  if (lang.startsWith("en")) return "en";
  return "de";
}

export function resolveLocale(setting: LocaleSetting): Locale {
  return setting === "auto" ? detectLocale() : setting;
}

export function translate(locale: Locale, key: TranslationKey, vars?: Vars): string {
  const raw = DICTS[locale][key] ?? key;
  if (!vars) return raw;
  let out = raw;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{${k}}`).join(String(v));
  }
  return out;
}

export function useLocale(): Locale {
  const setting = useSettingsStore((s) => s.locale);
  return resolveLocale(setting);
}

export function useT(): (key: TranslationKey, vars?: Vars) => string {
  const locale = useLocale();
  return useMemo(() => (key, vars) => translate(locale, key, vars), [locale]);
}
