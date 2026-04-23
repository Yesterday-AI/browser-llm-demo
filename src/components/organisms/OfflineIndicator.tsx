import { useOnline } from "@/hooks/useOnline.ts";
import { useT } from "@/lib/i18n/index.ts";
import { WifiOff } from "lucide-react";
import { Badge } from "../atoms/Badge.tsx";

export function OfflineIndicator() {
  const t = useT();
  const online = useOnline();
  if (online) return null;
  return (
    <Badge tone="warning">
      <WifiOff className="h-3 w-3" />
      {t("offline.badge")}
    </Badge>
  );
}
