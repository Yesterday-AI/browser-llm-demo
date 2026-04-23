import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type StoredMessage,
  appendMessage,
  createConversation as dbCreateConversation,
  deleteConversation as dbDeleteConversation,
  renameConversation as dbRenameConversation,
  loadMessages,
  newId,
} from "./db.ts";
import { resolveLocale, translate } from "./i18n/index.ts";
import { useLlmStore } from "./llm-store.ts";
import { DEFAULT_MODEL_ID, type ModelId } from "./model-catalog.ts";
import { type Turn, renderGemmaPrompt } from "./prompt-template.ts";
import { useSettingsStore } from "./settings-store.ts";

type ChatStore = {
  currentId: string | null;
  messages: StoredMessage[];
  isRunning: boolean;
  abort: AbortController | null;

  selectConversation: (id: string | null) => Promise<void>;
  newConversation: (modelId?: ModelId) => Promise<string>;
  deleteConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;

  sendUserMessage: (text: string) => Promise<void>;
  cancel: () => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentId: null,
      messages: [],
      isRunning: false,
      abort: null,

      selectConversation: async (id) => {
        if (!id) {
          set({ currentId: null, messages: [] });
          return;
        }
        const messages = await loadMessages(id);
        set({ currentId: id, messages });
      },

      newConversation: async (modelId) => {
        const resolved = modelId ?? useLlmStore.getState().modelId ?? DEFAULT_MODEL_ID;
        const convo = await dbCreateConversation(resolved);
        set({ currentId: convo.id, messages: [] });
        return convo.id;
      },

      deleteConversation: async (id) => {
        await dbDeleteConversation(id);
        if (get().currentId === id) {
          set({ currentId: null, messages: [] });
        }
      },

      renameConversation: async (id, title) => {
        await dbRenameConversation(id, title);
      },

      sendUserMessage: async (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const llmState = useLlmStore.getState();
        if (!llmState.llm.ready) return;
        if (get().isRunning) return;

        let conversationId = get().currentId;
        if (!conversationId) {
          conversationId = await get().newConversation();
        }

        const now = Date.now();
        const userMsg: StoredMessage = {
          id: newId(),
          conversationId,
          role: "user",
          content: trimmed,
          createdAt: now,
        };

        const assistantMsg: StoredMessage = {
          id: newId(),
          conversationId,
          role: "assistant",
          content: "",
          createdAt: now + 1,
        };

        set({
          messages: [...get().messages, userMsg, assistantMsg],
          isRunning: true,
        });

        await appendMessage(userMsg);

        const ctrl = new AbortController();
        set({ abort: ctrl });

        try {
          const historyTurns: Turn[] = [...get().messages]
            .filter((m) => m.role !== "assistant" || m.content.length > 0)
            .map((m) => ({ role: m.role, content: m.content }));
          const s = useSettingsStore.getState();
          // null = use i18n default; "" = explicitly no system prompt; otherwise custom.
          const systemPrompt =
            s.systemPrompt === null
              ? translate(resolveLocale(s.locale), "systemPrompt.default")
              : s.systemPrompt;
          const turns: Turn[] = systemPrompt
            ? [{ role: "system", content: systemPrompt }, ...historyTurns]
            : historyTurns;
          const prompt = renderGemmaPrompt(turns);

          if (import.meta.env.DEV) {
            console.groupCollapsed(
              `[chat] prompt · ${turns.length} turns · ${prompt.length} chars · ${llmState.llm.sizeInTokens(prompt)} tokens`,
            );
            console.log("turns:", turns);
            console.log("rendered prompt:");
            console.log(prompt);
            console.groupEnd();
          }

          const startedAt = performance.now();
          let firstChunkAt: number | null = null;
          let finalText = "";
          for await (const chunk of llmState.llm.generate(prompt, ctrl.signal)) {
            if (firstChunkAt === null) firstChunkAt = performance.now();
            finalText = chunk;
            set({
              messages: get().messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: chunk } : m,
              ),
            });
          }
          const endedAt = performance.now();

          const cleanFinal = finalText.trim();
          if (cleanFinal) {
            const durationMs = endedAt - startedAt;
            const outputTokens = llmState.llm.sizeInTokens(cleanFinal);
            const stats = {
              ttftMs: (firstChunkAt ?? endedAt) - startedAt,
              durationMs,
              outputTokens,
              outputChars: cleanFinal.length,
              tokensPerSecond: durationMs > 0 ? (outputTokens * 1000) / durationMs : 0,
            };
            const persistedMsg = { ...assistantMsg, content: cleanFinal };
            set({
              messages: get().messages.map((m) =>
                m.id === assistantMsg.id ? { ...persistedMsg, stats } : m,
              ),
            });
            await appendMessage(persistedMsg);
            if (get().messages.filter((m) => m.conversationId === conversationId).length === 2) {
              await dbRenameConversation(conversationId, makeTitle(trimmed));
            }
          } else {
            // Generation produced nothing usable (stop-token-match or abort).
            // Drop the empty assistant placeholder so the next turn doesn't see
            // two consecutive user turns and get confused.
            set({
              messages: get().messages.filter((m) => m.id !== assistantMsg.id),
            });
          }
        } catch (err) {
          console.error("[chat] generation failed", err);
          set({
            messages: get().messages.filter((m) => m.id !== assistantMsg.id),
          });
        } finally {
          set({ isRunning: false, abort: null });
        }
      },

      cancel: () => {
        get().abort?.abort();
      },
    }),
    {
      name: "browser-llm-demo:chat",
      partialize: (s) => ({ currentId: s.currentId }),
      onRehydrateStorage: () => (state) => {
        if (state?.currentId) {
          void state.selectConversation(state.currentId);
        }
      },
    },
  ),
);

function makeTitle(firstMessage: string): string {
  const line = firstMessage.split("\n")[0]?.trim() ?? "";
  if (!line) {
    const s = useSettingsStore.getState();
    return translate(resolveLocale(s.locale), "sidebar.fallbackTitle");
  }
  return line.length > 48 ? `${line.slice(0, 48).trimEnd()}…` : line;
}
