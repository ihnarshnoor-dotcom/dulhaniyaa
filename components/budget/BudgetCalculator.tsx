"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FacilitatorError,
  getPlan,
  getServices,
  type Basics,
  type Plan,
  type RateCard,
} from "@/lib/facilitator";
import {
  MAX_EVENTS,
  MAX_GUESTS,
  MAX_SERVICES,
  MIN_GUESTS,
  budgetOptions,
  estimate,
  inrRange,
  withReadableNames,
} from "@/lib/budget";
import {
  CalendarDays,
  CalendarHeart,
  ListChecks,
  MapPin,
  Pencil,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { ChevronLeftIcon } from "@/components/ui/Icons";
import { LeadError, sendLeadEmail } from "@/lib/web3forms";
import { LeadForm, type Contact } from "./LeadForm";
import { PlanLoading } from "./PlanLoading";
import { PlanResult } from "./PlanResult";
import {
  BudgetStep,
  CityStep,
  DateStep,
  EventsStep,
  GuestsStep,
  LoadError,
  ServicesStep,
  VibeStep,
} from "./Steps";

const steps = [
  { id: "events", label: "Events", icon: CalendarHeart },
  { id: "city", label: "City", icon: MapPin },
  { id: "guests", label: "Guests", icon: Users },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "date", label: "Date", icon: CalendarDays },
  { id: "vibe", label: "Vibe", icon: Sparkles },
  { id: "services", label: "Services", icon: ListChecks },
] as const;

const SERVICES_STEP = steps.length - 1;

type Phase = "build" | "loading" | "result" | "error";

export function BudgetCalculator() {
  // Rate card, loaded once.
  const [card, setCard] = useState<RateCard | null>(null);
  const [cardError, setCardError] = useState(false);
  const [cardAttempt, setCardAttempt] = useState(0);

  // Customer's answers. null = not answered yet, "" = skipped.
  const [step, setStep] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [guests, setGuests] = useState<number | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [vibe, setVibe] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Plan request.
  const [phase, setPhase] = useState<Phase>("build");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planError, setPlanError] = useState<"NETWORK" | "SERVER">("SERVER");
  const [sentBasics, setSentBasics] = useState<Basics | null>(null);
  const requesting = useRef(false);

  // Contact details asked for before the first plan. Kept only for this visit:
  // a reload or a new visit asks again.
  const [contact, setContact] = useState<Contact | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSending, setLeadSending] = useState(false);
  const [leadFailed, setLeadFailed] = useState<"NETWORK" | "SERVER" | null>(null);
  const closeLead = useCallback(() => setLeadOpen(false), []);

  const topRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let alive = true;
    getServices()
      .then((c) => alive && setCard(c))
      .catch(() => alive && setCardError(true));
    return () => {
      alive = false;
    };
  }, [cardAttempt]);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  // Keep the top of the calculator in view when the screen changes.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = topRef.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, phase]);

  const retryCard = () => {
    setCardError(false);
    setCardAttempt((n) => n + 1);
  };

  const goTo = (i: number) => {
    clearTimeout(advanceTimer.current);
    setStep(Math.max(0, Math.min(SERVICES_STEP, i)));
  };
  // Single-choice steps move on by themselves after a short beat.
  const advanceSoon = () => {
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => setStep((s) => Math.min(SERVICES_STEP, s + 1)), 280);
  };

  const toggleItem = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_SERVICES) next.add(id);
      return next;
    });

  const live = card && guests ? estimate(card, selected, guests, events.length) : null;

  // The facilitator doesn't validate, so we do.
  const basics: Basics | null =
    events.length > 0 && events.length <= MAX_EVENTS && city.trim() && guests != null && guests >= MIN_GUESTS && guests <= MAX_GUESTS
      ? {
          events,
          city: city.trim(),
          guestCount: guests,
          ...(budget ? { budget } : {}),
          ...(date ? { date } : {}),
        }
      : null;
  const canSubmit = basics != null && selected.size > 0 && selected.size <= MAX_SERVICES;

  async function submit() {
    if (!canSubmit || requesting.current) return;
    requesting.current = true;
    setSentBasics(basics);
    setPhase("loading");
    try {
      const result = await getPlan(basics, [...selected]);
      setPlan(card ? withReadableNames(result, card) : result);
      setPhase("result");
    } catch (err) {
      setPlanError(err instanceof FacilitatorError && err.message === "NETWORK" ? "NETWORK" : "SERVER");
      setPhase("error");
    } finally {
      requesting.current = false;
    }
  }

  // "Reveal my plan": ask for details first, once per visit.
  function reveal() {
    if (!canSubmit) return;
    if (contact) submit();
    else {
      setLeadFailed(null);
      setLeadOpen(true);
    }
  }

  async function sendDetails(details: Contact) {
    if (!basics || !card || leadSending) return;
    const totals = estimate(card, selected, basics.guestCount, basics.events.length);
    const services = card.categories.flatMap((c) =>
      c.items.filter((i) => selected.has(i.id)).map((i) => `${i.name} (${c.name})`),
    );
    setLeadSending(true);
    setLeadFailed(null);
    try {
      await sendLeadEmail({
        ...details,
        ...basics,
        services,
        estimate: `${inrRange(totals.min, totals.max) ?? "-"}${totals.onRequest ? ` + ${totals.onRequest} on request` : ""}`,
      });
    } catch (err) {
      const kind = err instanceof LeadError && err.message === "NETWORK" ? "NETWORK" : "SERVER";
      if (err instanceof LeadError && err.message === "CONFIG") {
        console.warn("[Lead] NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY is not set, so no email was sent.");
      }
      // Locally, carry on so the AI can still be tested while the email step is down.
      if (process.env.NODE_ENV === "production") {
        setLeadFailed(kind);
        setLeadSending(false);
        return;
      }
      console.warn("[Lead] Not sent. Continuing anyway because this is development mode.");
    }
    setLeadSending(false);
    setContact(details);
    setLeadOpen(false);
    submit();
  }

  function restart() {
    setStep(0);
    setEvents([]);
    setCity("");
    setGuests(null);
    setBudget(null);
    setDate(null);
    setVibe(null);
    setSelected(new Set());
    setPlan(null);
    setPhase("build");
  }

  // Answers so far, shown as chips that jump back to their step.
  const answers = [
    events.length > 0 && { step: 0, text: events.join(", ") },
    city && { step: 1, text: city },
    guests != null && { step: 2, text: `${guests.toLocaleString("en-IN")} guests` },
    budget != null && { step: 3, text: budgetOptions.find((b) => b.value === budget)?.label ?? "Budget open" },
    date != null && { step: 4, text: date || "Date open" },
  ].filter((a): a is { step: number; text: string } => Boolean(a));

  const StepIcon = steps[step].icon;

  return (
    <div ref={topRef} className="scroll-mt-24">
      <div className="rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-8">
        {phase === "build" && (
          <>
            {/* Progress */}
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                aria-label="Previous step"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 bg-white/70 text-ink transition hover:border-primary disabled:invisible"
              >
                <ChevronLeftIcon width={18} height={18} />
              </button>
              <ol className="flex flex-1 items-center gap-1.5" aria-label="Progress">
                {steps.map((s, i) => (
                  <li key={s.id} className="flex-1">
                    <button
                      type="button"
                      onClick={() => i < step && goTo(i)}
                      disabled={i >= step}
                      aria-label={`${s.label}${i === step ? " (current step)" : i < step ? " (done)" : ""}`}
                      aria-current={i === step ? "step" : undefined}
                      className={`block h-2 w-full rounded-full transition-colors duration-500 ${
                        i < step ? "bg-primary" : i === step ? "bg-primary/50" : "bg-ink/10"
                      } ${i < step ? "cursor-pointer hover:bg-primary-dark" : "cursor-default"}`}
                    />
                  </li>
                ))}
              </ol>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted tabular-nums">
                <StepIcon className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
                {step + 1}/{steps.length}
              </span>
            </div>

            {answers.length > 0 && step > 0 && (
              <div className="mb-6 flex flex-wrap justify-center gap-1.5">
                {answers.map((a) => (
                  <button
                    key={a.step}
                    type="button"
                    onClick={() => goTo(a.step)}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1 text-xs text-primary-dark transition hover:bg-secondary-dark"
                    title="Change"
                  >
                    <span className="truncate">{a.text}</span>
                    <Pencil className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                  </button>
                ))}
              </div>
            )}

            <div key={step} className="step-in">
              {step === 0 && <EventsStep events={events} onChange={setEvents} onNext={() => goTo(1)} />}
              {step === 1 && (
                <CityStep
                  city={city}
                  onPick={(c) => {
                    setCity(c);
                    advanceSoon();
                  }}
                />
              )}
              {step === 2 && <GuestsStep guests={guests} onChange={setGuests} onNext={() => goTo(3)} />}
              {step === 3 && (
                <BudgetStep
                  budget={budget}
                  onPick={(b) => {
                    setBudget(b);
                    advanceSoon();
                  }}
                />
              )}
              {step === 4 && (
                <DateStep
                  date={date}
                  onPick={(d) => {
                    setDate(d);
                    advanceSoon();
                  }}
                />
              )}
              {step === 5 && (
                <VibeStep
                  card={card}
                  cardError={cardError}
                  onRetry={retryCard}
                  vibe={vibe}
                  guests={guests ?? MIN_GUESTS}
                  eventCount={events.length}
                  onPick={(id, ids) => {
                    setVibe(id);
                    setSelected(new Set(ids));
                    advanceSoon();
                  }}
                />
              )}
              {step === 6 &&
                (card ? (
                  <ServicesStep card={card} selected={selected} onToggle={toggleItem} />
                ) : cardError ? (
                  <LoadError onRetry={retryCard} />
                ) : (
                  <div className="shimmer h-64 rounded-2xl" />
                ))}
            </div>

            {/* Live estimate + final call to action */}
            {step >= 5 && live && selected.size > 0 && (
              <div className="sticky bottom-4 z-10 mt-8">
                <div className="flex flex-col items-center gap-3 rounded-3xl bg-ink/90 p-4 text-white shadow-xl backdrop-blur-md sm:flex-row sm:justify-between sm:rounded-full sm:py-3 sm:pr-3 sm:pl-6">
                  <p className="text-center sm:text-left" aria-live="polite">
                    <span className="block text-[11px] tracking-widest text-white/60 uppercase">Live estimate</span>
                    <span className="font-serif text-xl sm:text-2xl">{inrRange(live.min, live.max)}</span>
                    <span className="ml-2 text-xs text-white/60">
                      {selected.size} services{live.onRequest > 0 && ` · +${live.onRequest} on request`}
                    </span>
                  </p>
                  {step === SERVICES_STEP && (
                    <button
                      type="button"
                      onClick={reveal}
                      disabled={!canSubmit}
                      className="min-h-12 w-full rounded-full bg-primary px-7 text-sm font-medium tracking-wide transition hover:bg-primary-dark disabled:opacity-40 sm:w-auto"
                    >
                      <span className="inline-flex items-center gap-2">
                        Reveal my plan
                        <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
            {step === SERVICES_STEP && card && selected.size === 0 && (
              <p className="mt-6 text-center text-sm text-muted">Pick at least one service to see your plan.</p>
            )}
          </>
        )}

        {phase === "loading" && <PlanLoading />}

        {phase === "error" && (
          <div className="step-in py-6">
            <LoadError
              message={
                planError === "NETWORK"
                  ? "Check your connection and try again."
                  : "Something went wrong while making your plan. Please try again."
              }
              onRetry={submit}
            />
            <div className="mt-4 text-center">
              <button type="button" onClick={() => setPhase("build")} className="text-sm text-muted hover:text-ink">
                ← Back to my choices
              </button>
            </div>
          </div>
        )}

        {phase === "result" && plan && sentBasics && (
          <PlanResult
            plan={plan}
            customerName={contact?.name}
            basics={sentBasics}
            onEdit={() => {
              setStep(SERVICES_STEP);
              setPhase("build");
            }}
            onRestart={restart}
          />
        )}
      </div>
      <LeadForm
        open={leadOpen}
        sending={leadSending}
        failed={leadFailed}
        onClose={closeLead}
        onSubmit={sendDetails}
      />
    </div>
  );
}
