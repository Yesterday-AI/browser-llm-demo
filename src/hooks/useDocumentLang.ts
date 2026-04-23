import { useLocale } from "@/lib/i18n/index.ts";
import { useEffect } from "react";

// Keep <html lang> in sync with the resolved locale so screen readers and
// spell-check pick the right language.
export function useDocumentLang(): void {
  const locale = useLocale();
  useEffect(() => {
    if (document.documentElement.lang !== locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);
}
