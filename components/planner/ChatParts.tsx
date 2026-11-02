"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { eventOptions } from "@/lib/budget";
import {
  PlannerChatError,
  sendChat,
  type ChatMessage,
} from "@/lib/plannerChat";

/* Shared by the "Plan my wedding" page and the floating planner bot. */

export const startQuestions = [
  "What happens in an Indian wedding?",
  "Walk me through the wedding events in order.",
];
export const followUps = [
  "What should we book first?",
  "When should we start planning?",
  "What does the family need to do?",
  "Which rituals need a pandit?",
];
export const eventQuestion = (event: string) => `What happens at the ${event}?`;
export const eventNames = eventOptions.map((e) => e.name);

function errorText(err: unknown) {
  if (err instanceof PlannerChatError && err.message === "NETWORK")
    return "We couldn't reach our planner. Check your connection and try again.";
  return "Our planner couldn't answer just now. Please try again.";
}

/** The conversation with the planner AI: ask a question, retry the last one if it failed. */
export function usePlannerChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  async function ask(question: string, history: ChatMessage[] = messages) {
    const next: ChatMessage[] = [
      ...history,
      { role: "user", content: question },
    ];
    setMessages(next);
    setError(null);
    setPending(true);
    controller.current?.abort();
    controller.current = new AbortController();
    try {
      const reply = await sendChat(next, controller.current.signal);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  // Ask the last question again (it is still at the end of the list, unanswered).
  function retry() {
    const last = messages.at(-1);
    if (last?.role === "user") void ask(last.content, messages.slice(0, -1));
  }

  const asked = new Set(
    messages.filter((m) => m.role === "user").map((m) => m.content),
  );

  return { messages, pending, error, ask, retry, asked };
}

export const chipClasses = (done: boolean, compact = false) =>
  `rounded-full border transition-colors disabled:opacity-50 ${
    compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
  } ${
    done
      ? "border-ink/10 bg-white/40 text-muted hover:border-primary/40"
      : "border-primary/30 bg-white/70 text-primary hover:border-primary hover:bg-secondary/40"
  }`;

export function Bubble({
  from,
  compact = false,
  children,
}: {
  from: ChatMessage["role"];
  compact?: boolean;
  children: ReactNode;
}) {
  const mine = from === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-3xl leading-relaxed ${
          compact
            ? "max-w-[88%] px-4 py-2.5 text-sm"
            : "max-w-[85%] px-5 py-3 text-[0.95rem] sm:max-w-[80%]"
        } ${
          mine
            ? "rounded-br-lg bg-primary text-white"
            : "rounded-bl-lg border border-ink/10 bg-white/70 text-ink"
        }`}
      >
        {!mine && <span className="sr-only">Planner: </span>}
        {children}
      </div>
    </div>
  );
}

export function TypingBubble({ compact = false }: { compact?: boolean }) {
  return (
    <Bubble from="assistant" compact={compact}>
      <span
        role="status"
        aria-label="Planner is typing"
        className="flex gap-1.5 py-1.5"
      >
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="size-2 animate-bounce rounded-full bg-primary/50 motion-reduce:animate-none"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </span>
    </Bubble>
  );
}

export function ChatError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
      {message}{" "}
      <button
        type="button"
        onClick={onRetry}
        className="font-semibold text-primary underline underline-offset-4"
      >
        Try again
      </button>
    </div>
  );
}

export function ChipGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-label={label}>
      <p className="mb-2 text-xs font-medium tracking-[0.2em] text-muted uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
