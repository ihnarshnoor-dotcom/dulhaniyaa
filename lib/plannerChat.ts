/**
 * "Plan my wedding" chat, served by the facilitator (same server and env var as lib/facilitator.ts).
 * The server owns the prompt and the AI key; the browser only sends the conversation.
 */

// Same base URL rules as lib/facilitator.ts. Trailing slashes are trimmed so we never build "//api".
const BASE = (process.env.FACILITATOR_URL ?? "https://facilitator-five.vercel.app").replace(/\/+$/, "");

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** Thrown with message "NETWORK" when the server can't be reached, otherwise the server's error text. */
export class PlannerChatError extends Error {}

const MAX_MESSAGES = 20;
const MAX_CONTENT = 2000;

/**
 * What to send: the most recent messages, starting with a user message, each trimmed to a safe length.
 * Keeps requests small however long the visitor keeps tapping.
 */
export function historyForRequest(messages: ChatMessage[]): ChatMessage[] {
  let recent = messages.slice(-MAX_MESSAGES);
  while (recent.length > 0 && recent[0].role !== "user") recent = recent.slice(1);
  return recent.map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT) }));
}

export async function sendChat(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api/dulhaniyaa/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: historyForRequest(messages) }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new PlannerChatError("NETWORK");
  }
  const data = (await res.json().catch(() => ({}))) as { reply?: unknown; error?: unknown };
  if (!res.ok || typeof data.reply !== "string" || !data.reply.trim()) {
    throw new PlannerChatError(typeof data.error === "string" && data.error ? data.error : "SERVER");
  }
  return data.reply.trim();
}
