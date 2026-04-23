import { useInstallPrompt } from "@/hooks/useInstallPrompt.ts";
import { useT } from "@/lib/i18n/index.ts";
import { Download, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../atoms/Button.tsx";
import { IconButton } from "../molecules/IconButton.tsx";

export function InstallPrompt() {
  const t = useT();
  const { canInstall, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("browser-llm-demo:install-dismissed") === "1";
    } catch {
      return false;
    }
  });

  if (!canInstall || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("browser-llm-demo:install-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:bottom-6">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-neutral-700 bg-neutral-900/95 p-3 text-sm text-neutral-100 shadow-lg backdrop-blur">
        <Download className="h-4 w-4 flex-none" aria-hidden="true" />
        <span className="flex-1">{t("install.question")}</span>
        <Button size="sm" onClick={() => void install()}>
          {t("install.button")}
        </Button>
        <IconButton
          variant="ghost"
          size="sm"
          icon={<X className="h-4 w-4" />}
          label={t("install.dismiss")}
          onClick={dismiss}
        />
      </div>
    </div>
  );
}
