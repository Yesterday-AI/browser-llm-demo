import { cn } from "@/lib/cn.ts";
import { useT } from "@/lib/i18n/index.ts";
import { ThreadListItemPrimitive, ThreadListPrimitive } from "@assistant-ui/react";
import { MessagesSquare, Plus, Trash2 } from "lucide-react";

export function ConversationSidebar({ className }: { className?: string }) {
  const t = useT();
  return (
    <aside
      className={cn(
        "flex w-full flex-col gap-2 border-neutral-800/50 p-3 sm:w-64 sm:border-r",
        className,
      )}
    >
      <ThreadListPrimitive.Root className="flex flex-col gap-2">
        <ThreadListPrimitive.New className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-700 text-sm font-medium text-neutral-100 transition hover:bg-neutral-800">
          <Plus className="h-4 w-4" />
          {t("sidebar.newThread")}
        </ThreadListPrimitive.New>

        <div className="flex-1 overflow-y-auto">
          <ThreadListPrimitive.Items components={{ ThreadListItem: ConversationItem }} />
        </div>
      </ThreadListPrimitive.Root>
    </aside>
  );
}

function ConversationItem() {
  const t = useT();
  return (
    <ThreadListItemPrimitive.Root
      className={cn(
        "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 transition",
        "hover:bg-neutral-800 hover:text-neutral-50",
        "data-[active]:bg-neutral-800 data-[active]:text-neutral-50",
      )}
    >
      <ThreadListItemPrimitive.Trigger className="flex flex-1 items-center gap-2 overflow-hidden text-left">
        <MessagesSquare className="h-4 w-4 flex-none text-neutral-500" />
        <span className="truncate">
          <ThreadListItemPrimitive.Title fallback={t("sidebar.fallbackTitle")} />
        </span>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemPrimitive.Delete
        className="flex-none rounded-md p-1 text-neutral-500 opacity-0 transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
        aria-label={t("sidebar.delete")}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </ThreadListItemPrimitive.Delete>
    </ThreadListItemPrimitive.Root>
  );
}
