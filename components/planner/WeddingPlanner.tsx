"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { saveHandoff } from "@/lib/plannerHandoff";
import {
  Bubble,
  ChatError,
  ChipGroup,
  TypingBubble,
  chipClasses,
  eventNames,
  eventQuestion,
  followUps,
  startQuestions,
  usePlannerChat,
} from "./ChatParts";
import { ReplyText } from "./ReplyText";

const MAX_QUESTION = 500;

/**
 * "Plan my wedding": a chat that explains what happens at an Indian wedding.
 * Visitors tap a suggested question or type their own. Events they add go to the budget calculator.
 */
export function WeddingPlanner() {
  const router = useRouter();
  const { messages, pending, error, ask, retry, asked } = usePlannerChat();
  // The event the latest answer was about, so we can offer "Add it to my wedding".
  const [topic, setTopic] = useState<string | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

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

  function askAbout(question: string) {
    setTopic(eventNames.find((e) => question === eventQuestion(e)) ?? null);
    void ask(question);
  }

  function sendDraft(e: FormEvent) {
    e.preventDefault();
    const question = draft.trim();
    if (!question || pending) return;
    setDraft("");
    askAbout(question);
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

  const started = messages.length > 0;

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
            what happens at each, and what to plan for. Tap a question below or
            type your own to begin.
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

        {pending && <TypingBubble />}
        {error && <ChatError message={error} onRetry={retry} />}
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

      {/* Type a question */}
      <form onSubmit={sendDraft} className="mt-6 flex gap-2">
        <label htmlFor="planner-question" className="sr-only">
          Ask our planner a question
        </label>
        <input
          id="planner-question"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={MAX_QUESTION}
          autoComplete="off"
          placeholder="Ask anything about your wedding…"
          className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white/80 px-5 py-3 text-[0.95rem] text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className={buttonClasses("primary", "shrink-0 disabled:opacity-50")}
        >
          Send
        </button>
      </form>

      {/* Questions to tap */}
      <div className="mt-8 space-y-5">
        {!started && (
          <ChipGroup label="Start here">
            {startQuestions.map((q) => (
              <button
                key={q}
                type="button"
                disabled={pending}
                onClick={() => askAbout(q)}
                className={chipClasses(false)}
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
              onClick={() => askAbout(eventQuestion(e))}
              className={chipClasses(asked.has(eventQuestion(e)))}
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
                  onClick={() => askAbout(q)}
                  className={chipClasses(false)}
                >
                  {q}
                </button>
              ))}
          </ChipGroup>
        )}
      </div>

      {/* Hand off to the calculator */}
      <div className="mt-10 flex flex-col items-center gap-2 rounded-3xl border border-ink/10 bg-white/60 p-4 text-center shadow-xl shadow-ink/5 sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-muted">
          {added.length > 0 ? (
            <>
              Your wedding:{" "}
              <span className="font-medium text-ink">{added.join(" · ")}</span>
            </>
          ) : (
            "Ready for prices? Add events as you go, or pick them in the Wedding Budgetor."
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
