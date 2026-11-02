"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Send } from "lucide-react";
import { vendorQuestions } from "@/data/vendorQuestions";
import { LeadError, sendQnaEmail } from "@/lib/web3forms";
import { logLead } from "@/lib/leads";
import { buttonClasses } from "@/components/ui/Button";
import { CheckIcon, ChevronLeftIcon } from "@/components/ui/Icons";
import { OptionChip } from "@/components/budget/OptionCard";
import { LeadForm, type Contact } from "@/components/budget/LeadForm";

type Props = {
  slug: string;
  serviceName: string;
};

/** Answers are keyed "<group>.<question>", e.g. "2.0". */
type Answers = Record<string, string[]>;
type Notes = Record<string, string>;

const NOTE_MAX = 200;
// The sheet allows 5000 characters in all, so each screen's summary is capped.
const SHEET_GROUP_MAX = 400;

const key = (g: number, q: number) => `${g}.${q}`;

function answerText(picked: string[] | undefined, note: string | undefined) {
  const parts = [picked?.join(", "), note?.trim()].filter(Boolean);
  return parts.join(" — ");
}

/**
 * The couple taps through one screen per group of questions, then leaves their details.
 * Answers go to the team's inbox (Web3Forms) and a copy to the leads sheet, like the enquiry form.
 */
export function VendorQna({ slug, serviceName }: Props) {
  // Read here rather than passed in: the group icons are components, which can't cross from the server page.
  const { groups } = vendorQuestions[slug];
  const last = groups.length - 1;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [notes, setNotes] = useState<Notes>({});
  const [openNotes, setOpenNotes] = useState<Set<string>>(new Set());

  const [leadOpen, setLeadOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState<"NETWORK" | "SERVER" | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const closeLead = useCallback(() => setLeadOpen(false), []);

  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = topRef.current;
    if (el && el.getBoundingClientRect().top < 0)
      el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, sentTo]);

  const pick = (k: string, option: string, multi?: boolean) =>
    setAnswers((prev) => {
      const current = prev[k] ?? [];
      const has = current.includes(option);
      const next = multi
        ? has
          ? current.filter((o) => o !== option)
          : [...current, option]
        : has
          ? []
          : [option];
      return { ...prev, [k]: next };
    });

  const answeredOn = (g: number) =>
    groups[g].questions.filter((_, q) => answers[key(g, q)]?.length).length;
  const group = groups[step];
  const GroupIcon = group.icon;
  const answeredHere = answeredOn(step);

  async function send(contact: Contact, website: string) {
    setSending(true);
    setFailed(null);

    // Email: one row per answered question, in order.
    const rows: Record<string, string> = {};
    groups.forEach((g, gi) =>
      g.questions.forEach((q, qi) => {
        const text = answerText(answers[key(gi, qi)], notes[key(gi, qi)]);
        if (text) rows[`${g.title} · ${q.label}`] = text;
      }),
    );

    try {
      await sendQnaEmail({
        service: serviceName,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        answers: Object.keys(rows).length
          ? rows
          : { Answers: "No questions answered" },
      });

      // Sheet: one column per screen, so the row stays within the sheet's limits.
      const perGroup = Object.fromEntries(
        groups.map((g, gi) => [
          g.title,
          g.questions
            .map((q, qi) => {
              const text = answerText(answers[key(gi, qi)], notes[key(gi, qi)]);
              return text && `${q.label}: ${text}`;
            })
            .filter(Boolean)
            .join("; ")
            .slice(0, SHEET_GROUP_MAX),
        ]),
      );
      void logLead(
        "vendor-qna",
        {
          service: serviceName,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          ...perGroup,
        },
        website,
      );

      setLeadOpen(false);
      setSentTo(contact.name.split(" ")[0]);
    } catch (err) {
      setFailed(
        err instanceof LeadError && err.message === "NETWORK"
          ? "NETWORK"
          : "SERVER",
      );
    } finally {
      setSending(false);
    }
  }

  if (sentTo) {
    return (
      <div
        ref={topRef}
        className="step-in relative z-10 scroll-mt-24 rounded-4xl border border-ink/10 bg-white p-8 text-center shadow-lg shadow-ink/5 sm:p-12"
        role="status"
      >
        <div className="pop mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary">
          <CheckIcon width={32} height={32} />
        </div>
        <h2 className="mt-6 text-4xl">Thank you, {sentTo}!</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
          We&apos;ve got your {serviceName.toLowerCase()} wishlist. Our team
          will go through it and get in touch with partners who fit you just
          right.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/vendors" className={buttonClasses("primary")}>
            Explore other services
          </Link>
          <Link href="/" className={buttonClasses("secondary")}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* Progress */}
      <div className="mb-4 flex items-center gap-3">
        <ol className="flex flex-1 items-center gap-1.5" aria-label="Progress">
          {groups.map((g, i) => (
            <li key={g.title} className="flex-1">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i >= step}
                aria-label={`${g.title}${i === step ? " (current step)" : i < step ? " (done)" : ""}`}
                aria-current={i === step ? "step" : undefined}
                className={`block h-2 w-full rounded-full transition-colors duration-500 ${
                  i < step
                    ? "bg-primary"
                    : i === step
                      ? "bg-primary/50"
                      : "bg-ink/10"
                } ${i < step ? "cursor-pointer hover:bg-primary-dark" : "cursor-default"}`}
              />
            </li>
          ))}
        </ol>
        <span
          title={group.title}
          className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted tabular-nums"
        >
          <GroupIcon
            className="size-4 text-primary"
            strokeWidth={1.75}
            aria-hidden
          />
          {step + 1}/{groups.length}
        </span>
      </div>

      {/* One screen per group */}
      <div key={step} className="step-in">
        <h2 className="sr-only">{group.title}</h2>

        <div className="space-y-4">
          {group.questions.map((q, qi) => {
            const k = key(step, qi);
            const picked = answers[k] ?? [];
            const noteOpen = openNotes.has(k) || !!notes[k];
            return (
              <fieldset
                key={q.label}
                className="relative z-10 rounded-3xl border border-ink/10 bg-white p-5 shadow-lg shadow-ink/5 sm:p-6"
              >
                <legend className="sr-only">{q.ask}</legend>
                <p aria-hidden className="text-lg leading-snug text-ink">
                  {q.ask}
                </p>
                {q.multi && (
                  <p className="mt-1 text-xs text-muted">
                    Pick as many as you like
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {q.options.map((option) => (
                    <OptionChip
                      key={option}
                      selected={picked.includes(option)}
                      onClick={() => pick(k, option, q.multi)}
                    >
                      {option}
                    </OptionChip>
                  ))}
                </div>
                {noteOpen ? (
                  <textarea
                    value={notes[k] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [k]: e.target.value }))
                    }
                    maxLength={NOTE_MAX}
                    rows={2}
                    placeholder="Anything else we should know?"
                    aria-label={`Add a detail: ${q.label}`}
                    className="mt-4 block w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenNotes((prev) => new Set(prev).add(k))}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:text-primary-dark"
                  >
                    <Plus className="size-3.5" strokeWidth={2} aria-hidden />
                    Add a detail
                  </button>
                )}
              </fieldset>
            );
          })}
        </div>
      </div>

      {/* Next / send */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              aria-label="Previous step"
              className="grid size-12 shrink-0 place-items-center rounded-full border border-ink/10 bg-white text-ink transition hover:border-primary"
            >
              <ChevronLeftIcon width={18} height={18} />
            </button>
          )}
          {step < last ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className={buttonClasses("primary", "min-w-48")}
            >
              {answeredHere ? "Next" : "Skip for now"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLeadOpen(true)}
              className={buttonClasses("primary", "min-w-48")}
            >
              <span className="inline-flex items-center gap-2">
                Send my answers
                <Send className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
            </button>
          )}
        </div>
        <p className="text-xs text-muted">
          Every question is optional. Answer what you know.
        </p>
      </div>

      <LeadForm
        open={leadOpen}
        sending={sending}
        failed={failed}
        onClose={closeLead}
        onSubmit={send}
        copy={{
          title: "Almost there!",
          text: `Tell us who you are and we'll send your ${serviceName.toLowerCase()} wishlist to our team. We may call to help you find the perfect match.`,
          submit: "Send my answers",
        }}
      />
    </div>
  );
}
