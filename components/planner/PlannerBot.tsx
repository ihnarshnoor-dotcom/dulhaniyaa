"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { CloseIcon } from "@/components/ui/Icons";
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

const SHOW_AFTER_MS = 5000;

/**
 * Floating planner bot, bottom-right above the WhatsApp button. Shows up 5 seconds after the site loads.
 * Same AI as "Plan my wedding", but tap-only: visitors pick suggested questions, they never type.
 * Lives in the root layout, so the conversation carries over as visitors move between pages.
 */
export function PlannerBot() {
  const pathname = usePathname();
  const { messages, pending, error, ask, retry, asked } = usePlannerChat();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Focus moves into the panel when it opens; Escape closes it and returns focus to the launcher.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      launcherRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Scroll to the top of the newest message, so long answers read from their start.
  useEffect(() => {
    const box = scrollRef.current;
    const last = logRef.current?.lastElementChild;
    if (!open || !box || !(last instanceof HTMLElement) || messages.length === 0) return;
    const smooth = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;
    box.scrollTo({ top: last.offsetTop - 16, behavior: smooth ? "smooth" : "auto" });
  }, [open, messages.length, pending, error]);

  // The full planner has its own chat, so the bot stays out of the way there.
  if (!visible || pathname === "/plan-my-wedding") return null;

  const started = messages.length > 0;
  const chip = (question: string, label = question, done = false) => (
    <button
      key={question}
      type="button"
      disabled={pending}
      onClick={() => ask(question)}
      className={`${chipClasses(done, true)} text-left`}
    >
      {label}
    </button>
  );

  return (
    <>
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-labelledby={titleId}
          className="photo-in fixed right-4 bottom-36 z-40 flex max-h-[min(34rem,calc(100svh-15rem))] w-[calc(100vw-2rem)] max-w-sm origin-bottom-right flex-col overflow-hidden rounded-3xl border border-ink/10 bg-ivory shadow-2xl shadow-ink/15 sm:right-6 sm:bottom-40 sm:max-h-[min(36rem,calc(100svh-13rem))]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-ink/10 bg-white/60 px-5 py-3.5">
            <div>
              <h2 id={titleId} className="text-xl leading-tight">
                Wedding planner
              </h2>
              <p className="text-xs text-muted">Tap a question to ask our AI planner</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label="Close the planner"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-secondary/60 hover:text-primary"
            >
              <CloseIcon width={18} height={18} />
            </button>
          </div>

          <div ref={scrollRef} className="relative flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <div
              ref={logRef}
              role="log"
              aria-live="polite"
              aria-busy={pending}
              className="space-y-3"
            >
              <Bubble from="assistant" compact>
                <p>
                  Namaste! Curious what happens at an Indian wedding? Tap a question below and
                  I&apos;ll explain.
                </p>
              </Bubble>

              {messages.map((m, i) => (
                <Bubble key={i} from={m.role} compact>
                  {m.role === "assistant" ? <ReplyText text={m.content} /> : <p>{m.content}</p>}
                </Bubble>
              ))}

              {pending && <TypingBubble compact />}
              {error && <ChatError message={error} onRetry={retry} />}
            </div>

            <div className="space-y-4 border-t border-ink/10 pt-4">
              {!started && (
                <ChipGroup label="Start here">{startQuestions.map((q) => chip(q))}</ChipGroup>
              )}
              <ChipGroup label="Learn about an event">
                {eventNames.map((e) => chip(eventQuestion(e), e, asked.has(eventQuestion(e))))}
              </ChipGroup>
              {started && (
                <ChipGroup label="Good to know">
                  {[...startQuestions, ...followUps].filter((q) => !asked.has(q)).map((q) => chip(q))}
                </ChipGroup>
              )}
            </div>
          </div>

          <div className="border-t border-ink/10 bg-white/60 px-5 py-3 text-xs text-muted">
            Want to ask your own question?{" "}
            <Link
              href="/plan-my-wedding"
              onClick={() => setOpen(false)}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Open the full planner →
            </Link>
          </div>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Close the planner" : "Ask our wedding planner"}
        className="pop fixed right-4 bottom-20 z-30 flex h-12 items-center gap-2 rounded-full border border-primary/20 bg-white px-3.5 text-primary shadow-lg shadow-ink/10 transition-colors hover:bg-secondary/40 sm:right-6 sm:bottom-24 sm:px-5"
      >
        {open ? <CloseIcon width={20} height={20} /> : <MessageCircleMore className="size-5" strokeWidth={1.75} />}
        <span className="hidden text-sm font-medium sm:inline">
          {open ? "Close" : "Ask our planner"}
        </span>
      </button>
    </>
  );
}
