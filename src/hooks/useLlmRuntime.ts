import { useChatStore } from "@/lib/chat-store.ts";
import { db } from "@/lib/db.ts";
import type { StoredMessage } from "@/lib/db.ts";
import {
  type ExternalStoreAdapter,
  type ThreadMessageLike,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

function toAssistantMessage(m: StoredMessage): ThreadMessageLike {
  return {
    id: m.id,
    role: m.role,
    content: [{ type: "text", text: m.content }],
    createdAt: new Date(m.createdAt),
  };
}

export function useLlmRuntime() {
  const messages = useChatStore((s) => s.messages);
  const isRunning = useChatStore((s) => s.isRunning);
  const currentId = useChatStore((s) => s.currentId);
  const sendUserMessage = useChatStore((s) => s.sendUserMessage);
  const cancel = useChatStore((s) => s.cancel);
  const newConversation = useChatStore((s) => s.newConversation);
  const selectConversation = useChatStore((s) => s.selectConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const renameConversation = useChatStore((s) => s.renameConversation);

  const threads = useLiveQuery(
    async () => await db.conversations.orderBy("updatedAt").reverse().toArray(),
    [],
    [],
  );

  const adapter: ExternalStoreAdapter<StoredMessage> = useMemo(
    () => ({
      messages,
      isRunning,
      convertMessage: toAssistantMessage,
      onNew: async (msg) => {
        const text = msg.content
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("")
          .trim();
        await sendUserMessage(text);
      },
      onCancel: async () => {
        cancel();
      },
      adapters: {
        threadList: {
          threadId: currentId ?? undefined,
          threads:
            threads?.map((t) => ({
              status: "regular" as const,
              id: t.id,
              title: t.title,
            })) ?? [],
          onSwitchToNewThread: async () => {
            await newConversation();
          },
          onSwitchToThread: async (id) => {
            await selectConversation(id);
          },
          onRename: async (id, title) => {
            await renameConversation(id, title);
          },
          onDelete: async (id) => {
            await deleteConversation(id);
          },
        },
      },
    }),
    [
      messages,
      isRunning,
      currentId,
      threads,
      sendUserMessage,
      cancel,
      newConversation,
      selectConversation,
      deleteConversation,
      renameConversation,
    ],
  );

  return useExternalStoreRuntime(adapter);
}
