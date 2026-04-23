import type { de } from "./de.ts";

export type TranslationKey = keyof typeof de;
export type Dict = Record<TranslationKey, string>;
export type Locale = "de" | "en";
export type LocaleSetting = Locale | "auto";
export type Vars = Record<string, string | number>;
