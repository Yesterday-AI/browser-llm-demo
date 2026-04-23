import { useChatStore } from "@/lib/chat-store.ts";
import { cn } from "@/lib/cn.ts";
import { useT } from "@/lib/i18n/index.ts";
import {
  ComposerPrimitive,
  MessagePartPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useMessage,
} from "@assistant-ui/react";
import { ArrowUp, StopCircle } from "lucide-react";
import { AsteriskAnimation } from "../atoms/AsteriskAnimation.tsx";
import { Avatar } from "../atoms/Avatar.tsx";
import { AssistantMarkdown } from "../molecules/AssistantMarkdown.tsx";
import { MessageBubble } from "../molecules/MessageBubble.tsx";
import { MessageStatsFooter } from "../molecules/MessageStatsFooter.tsx";

function PlainText() {
  return <MessagePartPrimitive.Text className="whitespace-pre-wrap break-words" />;
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="mb-4 flex justify-end">
      <MessageBubble speaker="user">
        <MessagePrimitive.Parts components={{ Text: PlainText }} />
      </MessageBubble>
    </MessagePrimitive.Root>
  );
}

function AssistantStats() {
  const messageId = useMessage((m) => m.id);
  const stats = useChatStore((s) => s.messages.find((x) => x.id === messageId)?.stats);
  if (!stats) return null;
  return <MessageStatsFooter stats={stats} />;
}

function AssistantMessage() {
  const t = useT();
  const hasText = useMessage((m) => m.content.some((p) => p.type === "text" && p.text.length > 0));
  const phases = [t("chat.gen.0"), t("chat.gen.1"), t("chat.gen.2")];
  return (
    <MessagePrimitive.Root className="mb-4 flex items-start gap-2">
      <Avatar alt="Assistant" size="md" className="mt-1 flex-none" />
      <div className="flex flex-col">
        <MessageBubble speaker="assistant">
          {hasText ? (
            <MessagePrimitive.Parts components={{ Text: AssistantMarkdown }} />
          ) : (
            <AsteriskAnimation phases={phases} phaseMs={1600} size="sm" />
          )}
        </MessageBubble>
        <AssistantStats />
      </div>
    </MessagePrimitive.Root>
  );
}

export function ChatThread({ disabled }: { disabled?: boolean }) {
  const t = useT();
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport
        autoScroll
        className="flex-1 overflow-y-auto px-4 pt-4 pb-2 [scrollbar-gutter:stable]"
      >
        <ThreadPrimitive.Empty>
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            {t("chat.empty")}
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
      </ThreadPrimitive.Viewport>

      <div className="sticky bottom-0 border-t border-neutral-800/50 bg-neutral-950/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <ComposerPrimitive.Root
          className={cn(
            "mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 p-2 transition focus-within:border-neutral-500",
            disabled && "opacity-50",
          )}
        >
          <ComposerPrimitive.Input
            placeholder={disabled ? t("chat.placeholderDisabled") : t("chat.placeholder")}
            disabled={disabled}
            rows={1}
            autoFocus
            className="flex max-h-40 min-h-6 flex-1 resize-none bg-transparent px-2 py-1 text-base text-neutral-50 placeholder:text-neutral-500 focus:outline-none disabled:cursor-not-allowed"
          />

          <ThreadPrimitive.If running={false}>
            <ComposerPrimitive.Send
              disabled={disabled}
              className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-neutral-50 text-neutral-900 transition hover:bg-neutral-200 disabled:opacity-40"
              aria-label={t("chat.send")}
            >
              <ArrowUp className="h-4 w-4" />
            </ComposerPrimitive.Send>
          </ThreadPrimitive.If>

          <ThreadPrimitive.If running>
            <ComposerPrimitive.Cancel
              className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
              aria-label={t("chat.cancel")}
            >
              <StopCircle className="h-4 w-4" />
            </ComposerPrimitive.Cancel>
          </ThreadPrimitive.If>
        </ComposerPrimitive.Root>
      </div>
    </ThreadPrimitive.Root>
  );
}
