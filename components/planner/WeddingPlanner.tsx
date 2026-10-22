"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { eventOptions } from "@/lib/budget";
import { saveHandoff } from "@/lib/plannerHandoff";
import {
  PlannerChatError,
  sendChat,
  type ChatMessage,
} from "@/lib/plannerChat";
import { ReplyText } from "./ReplyText";

const startQuestions = [
  "What happens in an Indian wedding?",
  "Walk me through the wedding events in order.",
];
const followUps = [
  "What should we book first?",
  "When should we start planning?",
  "What does the family need to do?",
  "Which rituals need a pandit?",
];
const eventQuestion = (event: string) => `What happens at the ${event}?`;
const eventNames = eventOptions.map((e) => e.name);

function errorText(err: unknown) {
  if (err instanceof PlannerChatError && err.message === "NETWORK")
    return "We couldn't reach our planner. Check your connection and try again.";
  return "Our planner couldn't answer just now. Please try again.";
}

/**
 * "Plan my wedding": a tap-only chat that explains what happens at an Indian wedding.
 * Visitors never type; every question is a button. Events they add go to the budget calculator.
 */
export function WeddingPlanner() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The event the latest answer was about, so we can offer "Add it to my wedding".
  const [topic, setTopic] = useState<string | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  // Keep the newest message in view.
  useEffect(() => {
    if (messages.length === 0) return;
    const smooth = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;
    endRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }, [messages.length, pending, error]);

  async function ask(question: string, history: ChatMessage[] = messages) {
    const next: ChatMessage[] = [
      ...history,
      { role: "user", content: question },
    ];
    setMessages(next);
    setError(null);
    setPending(true);
    setTopic(eventNames.find((e) => question === eventQuestion(e)) ?? null);
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

  function toggleAdded(event: string) {
    setAdded((list) =>
      list.includes(event)
        ? list.filter((e) => e !== event)
        : eventNames.filter((e) => e === event || list.includes(e)),
    );
  }

  function getQuote() {
    saveHandoff(added);
    router.push("/budget-calculator");
  }

  const asked = new Set(
    messages.filter((m) => m.role === "user").map((m) => m.content),
  );
  const started = messages.length > 0;
  const chip = (done: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
      done
        ? "border-ink/10 bg-white/40 text-muted hover:border-primary/40"
        : "border-primary/30 bg-white/70 text-primary hover:border-primary hover:bg-secondary/40"
    }`;

  return (
    <div className="mx-auto max-w-2xl">
      {/* Conversation */}
      <div
        role="log"
        aria-live="polite"
        aria-busy={pending}
        className="space-y-4"
      >
        <Bubble from="assistant">
          <p>
            Namaste! I&apos;m here to help you picture your wedding: the events,
            what happens at each, and what to plan for. Tap a question below to
            begin.
          </p>
        </Bubble>

        {messages.map((m, i) => (
          <Bubble key={i} from={m.role}>
            {m.role === "assistant" ? (
              <ReplyText text={m.content} />
            ) : (
              <p>{m.content}</p>
            )}
          </Bubble>
        ))}

        {pending && (
          <Bubble from="assistant">
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
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl bg-red-50 p-4 text-sm text-red-800"
          >
            {error}{" "}
            <button
              type="button"
              onClick={retry}
              className="font-semibold text-primary underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Add the event that was just explained */}
      {topic && !pending && !error && (
        <div className="mt-4 flex justify-start">
          <button
            type="button"
            onClick={() => toggleAdded(topic)}
            aria-pressed={added.includes(topic)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              added.includes(topic)
                ? "bg-primary text-white"
                : "bg-secondary text-primary hover:bg-secondary-dark"
            }`}
          >
            {added.includes(topic) ? (
              <>
                <CheckIcon width={16} height={16} /> {topic} is in your wedding
              </>
            ) : (
              <>+ Add {topic} to my wedding</>
            )}
          </button>
        </div>
      )}

      {/* Questions to tap */}
      <div className="mt-8 space-y-5">
        {!started && (
          <ChipGroup label="Start here">
            {startQuestions.map((q) => (
              <button
                key={q}
                type="button"
                disabled={pending}
                onClick={() => ask(q)}
                className={chip(false)}
              >
                {q}
              </button>
            ))}
          </ChipGroup>
        )}

        <ChipGroup label="Learn about an event">
          {eventNames.map((e) => (
            <button
              key={e}
              type="button"
              disabled={pending}
              onClick={() => ask(eventQuestion(e))}
              className={chip(asked.has(eventQuestion(e)))}
            >
              {added.includes(e) && (
                <CheckIcon
                  width={14}
                  height={14}
                  className="-ml-1 mr-1 inline"
                />
              )}
              {e}
            </button>
          ))}
        </ChipGroup>

        {started && (
          <ChipGroup label="Good to know">
            {[...startQuestions, ...followUps]
              .filter((q) => !asked.has(q))
              .map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={pending}
                  onClick={() => ask(q)}
                  className={chip(false)}
                >
                  {q}
                </button>
              ))}
          </ChipGroup>
        )}
      </div>

      {/* Hand off to the calculator */}
      <div className="sticky bottom-4 z-10 mt-10 flex flex-col items-center gap-2 rounded-3xl border border-ink/10 bg-ivory/90 p-4 text-center shadow-xl shadow-ink/5 backdrop-blur-md sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-muted">
          {added.length > 0 ? (
            <>
              Your wedding:{" "}
              <span className="font-medium text-ink">{added.join(" · ")}</span>
            </>
          ) : (
            "Ready for prices? Add events as you go, or pick them in the calculator."
          )}
        </p>
        <button
          type="button"
          onClick={getQuote}
          className={buttonClasses("primary", "shrink-0")}
        >
          Get my quote →
        </button>
      </div>
    </div>
  );
}

function Bubble({
  from,
  children,
}: {
  from: ChatMessage["role"];
  children: ReactNode;
}) {
  const mine = from === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-3xl px-5 py-3 text-[0.95rem] leading-relaxed sm:max-w-[80%] ${
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

function ChipGroup({
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
