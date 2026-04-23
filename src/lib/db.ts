import Dexie, { type EntityTable } from "dexie";
import type { ModelId } from "./model-catalog.ts";

export type Conversation = {
  id: string;
  title: string;
  modelId: ModelId;
  createdAt: number;
  updatedAt: number;
};

export type StoredMessageRole = "user" | "assistant" | "system";

export type StoredMessage = {
  id: string;
  conversationId: string;
  role: StoredMessageRole;
  content: string;
  createdAt: number;
  // Optional in-memory stats for assistant messages.
  // Not persisted (Dexie ignores unknown keys on write, stats undefined on read).
  stats?: MessageStats;
};

export type MessageStats = {
  ttftMs: number; // time to first streamed chunk
  durationMs: number; // total generation time
  outputTokens: number;
  outputChars: number;
  tokensPerSecond: number;
};

type ClientAiDb = Dexie & {
  conversations: EntityTable<Conversation, "id">;
  messages: EntityTable<StoredMessage, "id">;
};

const db = new Dexie("browser-llm-demo") as ClientAiDb;

db.version(1).stores({
  conversations: "&id, updatedAt, createdAt",
  messages: "&id, conversationId, createdAt, [conversationId+createdAt]",
});

export { db };

export function newId(): string {
  return globalThis.crypto.randomUUID();
}

export async function createConversation(modelId: ModelId): Promise<Conversation> {
  const now = Date.now();
  const convo: Conversation = {
    id: newId(),
    title: "Neues Gespraech",
    modelId,
    createdAt: now,
    updatedAt: now,
  };
  await db.conversations.add(convo);
  return convo;
}

export async function deleteConversation(id: string): Promise<void> {
  await db.transaction("rw", db.conversations, db.messages, async () => {
    await db.messages.where({ conversationId: id }).delete();
    await db.conversations.delete(id);
  });
}

export async function renameConversation(id: string, title: string): Promise<void> {
  await db.conversations.update(id, { title, updatedAt: Date.now() });
}

export async function loadMessages(conversationId: string): Promise<StoredMessage[]> {
  return await db.messages
    .where("[conversationId+createdAt]")
    .between([conversationId, Dexie.minKey], [conversationId, Dexie.maxKey])
    .toArray();
}

export async function appendMessage(msg: StoredMessage): Promise<void> {
  // Strip in-memory-only fields before Dexie write.
  const { stats: _stats, ...persisted } = msg;
  await db.transaction("rw", db.conversations, db.messages, async () => {
    await db.messages.add(persisted);
    await db.conversations.update(msg.conversationId, { updatedAt: msg.createdAt });
  });
}

export async function touchConversation(id: string): Promise<void> {
  await db.conversations.update(id, { updatedAt: Date.now() });
}
