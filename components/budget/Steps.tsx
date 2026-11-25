"use client";

import { useState, type ReactNode } from "react";
import { CalendarPlus, CircleHelp, Crown, PenLine, type LucideIcon } from "lucide-react";
import type { RateCard } from "@/lib/facilitator";
import {
  MAX_EVENTS,
  MAX_GUESTS,
  MAX_SERVICES,
  MIN_GUESTS,
  budgetOptions,
  cityOptions,
  estimate,
  eventOptions,
  eventPresets,
  formatDay,
  guestOptions,
  idsForPreset,
  inrRange,
  levelLabels,
  pricingLabels,
  servicePresets,
  upcomingMonths,
  vibeOptions,
} from "@/lib/budget";
import { buttonClasses } from "@/components/ui/Button";
import { OptionCard, OptionChip } from "./OptionCard";

/** Round icon badge; fills in when its card is selected. */
function IconBadge({ icon: Icon, active, large = false }: { icon: LucideIcon; active: boolean; large?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid place-items-center rounded-full transition-colors duration-300 ${
        large ? "size-16" : "size-11"
      } ${active ? "bg-primary text-white" : "bg-secondary/70 text-primary"}`}
    >
      <Icon className={large ? "size-8" : "size-5"} strokeWidth={1.6} />
    </span>
  );
}

function StepTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-6 text-center sm:mb-8">
      <h2 className="text-3xl leading-tight sm:text-4xl">{title}</h2>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </div>
  );
}

function ContinueButton({
  onClick,
  disabled,
  children = "Continue",
}: {
  onClick: () => void;
  disabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={buttonClasses("primary", "min-w-48 disabled:cursor-not-allowed disabled:opacity-40")}
      >
        {children}
      </button>
    </div>
  );
}

/* ───────────── 1. Events ───────────── */

export function EventsStep({
  events,
  onChange,
  onNext,
}: {
  events: string[];
  onChange: (events: string[]) => void;
  onNext: () => void;
}) {
  const [custom, setCustom] = useState("");
  const customEvents = events.filter((e) => !eventOptions.some((o) => o.name === e));
  const full = events.length >= MAX_EVENTS;
  const toggle = (name: string) => {
    if (events.includes(name)) onChange(events.filter((e) => e !== name));
    else if (!full) onChange([...events, name]);
  };

  const addCustom = () => {
    const name = custom.trim();
    if (name && !full && !events.some((e) => e.toLowerCase() === name.toLowerCase())) onChange([...events, name]);
    setCustom("");
  };

  return (
    <>
      <StepTitle title="Which celebrations are on the cards?" hint="Tap as many as you like" />

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {eventPresets.map((p) => (
          <OptionChip
            key={p.label}
            selected={p.events.length === events.length && p.events.every((e) => events.includes(e))}
            onClick={() => onChange(p.events)}
          >
            {p.label}
          </OptionChip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {eventOptions.map((o) => (
          <OptionCard key={o.name} selected={events.includes(o.name)} onClick={() => toggle(o.name)}>
            <IconBadge icon={o.icon} active={events.includes(o.name)} />
            <span className="mt-3 block font-serif text-2xl">{o.name}</span>
            <span className="block text-xs text-muted">{o.note}</span>
          </OptionCard>
        ))}
        {customEvents.map((name) => (
          <OptionCard key={name} selected onClick={() => toggle(name)}>
            <IconBadge icon={CalendarPlus} active />
            <span className="mt-3 block font-serif text-2xl wrap-break-word">{name}</span>
            <span className="block text-xs text-muted">Your own</span>
          </OptionCard>
        ))}
        <form
          className="flex flex-col justify-between gap-2 rounded-2xl border border-dashed border-ink/20 bg-white/40 p-4 backdrop-blur-sm"
          onSubmit={(e) => {
            e.preventDefault();
            addCustom();
          }}
        >
          <label htmlFor="custom-event" className="text-xs text-muted">
            Something else?
          </label>
          <input
            id="custom-event"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={30}
            placeholder="e.g. Chooda"
            className="w-full rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button type="submit" disabled={!custom.trim() || full} className="text-left text-sm font-medium text-primary disabled:opacity-40">
            + Add
          </button>
        </form>
      </div>

      {full && <p className="mt-4 text-center text-sm text-muted">That&apos;s the maximum of {MAX_EVENTS} events.</p>}

      <ContinueButton onClick={onNext} disabled={events.length === 0}>
        {events.length === 0 ? "Pick at least one" : `Continue with ${events.length} event${events.length > 1 ? "s" : ""}`}
      </ContinueButton>
    </>
  );
}

/* ───────────── 2. City ───────────── */

export function CityStep({ city, onPick }: { city: string; onPick: (city: string) => void }) {
  const isListed = cityOptions.includes(city);
  const [typing, setTyping] = useState(city !== "" && !isListed);
  const [custom, setCustom] = useState(isListed ? "" : city);

  return (
    <>
      <StepTitle title="Where's the party?" hint="Pick a city and we'll move on" />
      <div className="flex flex-wrap justify-center gap-2.5">
        {cityOptions.map((c) => (
          <OptionChip key={c} selected={city === c} onClick={() => onPick(c)}>
            {c}
          </OptionChip>
        ))}
        <OptionChip selected={typing} onClick={() => setTyping(true)}>
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="size-4" strokeWidth={1.75} aria-hidden />
            Somewhere else
          </span>
        </OptionChip>
      </div>

      {typing && (
        <form
          className="step-in mx-auto mt-6 flex max-w-sm gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) onPick(custom.trim());
          }}
        >
          <label htmlFor="custom-city" className="sr-only">
            City
          </label>
          <input
            id="custom-city"
            autoFocus
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            maxLength={40}
            placeholder="Type your city"
            className="min-h-12 flex-1 rounded-full border border-ink/15 bg-white/80 px-5 outline-none focus:border-primary"
          />
          <button type="submit" disabled={!custom.trim()} className={buttonClasses("primary", "px-5 disabled:opacity-40")}>
            Go
          </button>
        </form>
      )}
    </>
  );
}

/* ───────────── 3. Guests ───────────── */

export function GuestsStep({
  guests,
  onChange,
  onNext,
}: {
  guests: number | null;
  onChange: (n: number) => void;
  onNext: () => void;
}) {
  const clamp = (n: number) => Math.min(MAX_GUESTS, Math.max(MIN_GUESTS, n));
  const step = guests != null && guests >= 500 ? 50 : 25;

  // What's in the box while typing; re-synced whenever guests changes from a card or the −/+ buttons.
  const [text, setText] = useState(guests != null ? String(guests) : "");
  const [synced, setSynced] = useState(guests);
  if (guests !== synced) {
    setSynced(guests);
    setText(guests != null ? String(guests) : "");
  }

  const type = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 5);
    setText(digits);
    const n = Number.parseInt(digits, 10);
    if (n >= MIN_GUESTS) {
      const next = clamp(n);
      setSynced(next);
      onChange(next);
    }
  };

  return (
    <>
      <StepTitle title="How big is the guest list?" hint="Pick the closest or type your own number" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {guestOptions.map((o) => (
          <OptionCard key={o.label} selected={guests === o.value} onClick={() => onChange(o.value)}>
            <span className="block font-serif text-2xl">{o.label}</span>
            <span className="block text-sm font-medium text-primary">~{o.value.toLocaleString("en-IN")} guests</span>
            <span className="block text-xs text-muted">{o.note}</span>
          </OptionCard>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label={`${step} fewer guests`}
          onClick={() => guests != null && onChange(clamp(guests - step))}
          disabled={guests == null || guests <= MIN_GUESTS}
          className="grid size-12 place-items-center rounded-full border border-ink/15 bg-white/70 text-xl backdrop-blur-sm hover:border-primary disabled:opacity-40"
        >
          −
        </button>
        <label className="min-w-32 text-center">
          <input
            type="text"
            inputMode="numeric"
            value={text}
            onChange={(e) => type(e.target.value)}
            onBlur={() => setText(guests != null ? String(guests) : "")}
            placeholder="Type"
            aria-label={`Number of guests, ${MIN_GUESTS} to ${MAX_GUESTS.toLocaleString("en-IN")}`}
            className="w-32 border-b border-ink/15 bg-transparent text-center font-serif text-4xl outline-none placeholder:text-ink/30 focus:border-primary"
          />
          <span className="mt-1 block text-xs text-muted">guests (up to {MAX_GUESTS.toLocaleString("en-IN")})</span>
        </label>
        <button
          type="button"
          aria-label={`${step} more guests`}
          onClick={() => onChange(guests == null ? guestOptions[0].value : clamp(guests + step))}
          disabled={guests != null && guests >= MAX_GUESTS}
          className="grid size-12 place-items-center rounded-full border border-ink/15 bg-white/70 text-xl backdrop-blur-sm hover:border-primary disabled:opacity-40"
        >
          +
        </button>
      </div>

      <ContinueButton onClick={onNext} disabled={guests == null}>
        Continue
      </ContinueButton>
    </>
  );
}

/* ───────────── 4. Budget ───────────── */

export function BudgetStep({ budget, onPick }: { budget: string | null; onPick: (b: string) => void }) {
  return (
    <>
      <StepTitle title="What budget feels comfortable?" hint="A rough idea helps us plan smarter" />
      <div className="grid gap-3 sm:grid-cols-2">
        {budgetOptions.map((o) => (
          <OptionCard key={o.value} selected={budget === o.value} onClick={() => onPick(o.value)}>
            <span className="font-serif text-2xl">{o.label}</span>
          </OptionCard>
        ))}
        <OptionCard selected={budget === ""} onClick={() => onPick("")}>
          <span className="flex items-center gap-2 font-serif text-2xl">
            <CircleHelp className="size-6 shrink-0 text-primary" strokeWidth={1.6} aria-hidden />
            Still figuring it out
          </span>
        </OptionCard>
      </div>
    </>
  );
}

/* ───────────── 5. Date ───────────── */

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Pick a month, then a day in it (or keep the whole month if the day isn't fixed). */
export function DateStep({ date, onPick }: { date: string | null; onPick: (d: string) => void }) {
  const [months] = useState(() => upcomingMonths());
  const [today] = useState(() => new Date());
  // A saved date ("14 February 2027") or month ("February 2027") ends with its month's value.
  const [month, setMonth] = useState(() => (date ? (months.find((m) => date.endsWith(m.value)) ?? null) : null));

  if (month) {
    const daysInMonth = new Date(month.year, month.monthIndex + 1, 0).getDate();
    const leadingBlanks = (new Date(month.year, month.monthIndex, 1).getDay() + 6) % 7; // Monday first
    const isThisMonth = month.year === today.getFullYear() && month.monthIndex === today.getMonth();

    return (
      <>
        <StepTitle title={`Which day in ${month.value.split(" ")[0]}?`} hint="Tap the date, or keep the whole month open" />
        <div className="mx-auto max-w-md rounded-2xl border border-ink/10 bg-white/60 p-4 backdrop-blur-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => setMonth(null)} className="text-sm font-medium text-muted hover:text-ink">
              ← Months
            </button>
            <span className="font-serif text-xl">{month.value}</span>
            <span className="w-16" aria-hidden />
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted" aria-hidden>
            {weekdays.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const value = formatDay(month.year, month.monthIndex, day);
              const past = isThisMonth && day < today.getDate();
              const picked = date === value;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  onClick={() => onPick(value)}
                  aria-pressed={picked}
                  aria-label={value}
                  className={`aspect-square rounded-full text-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
                    picked ? "bg-primary font-medium text-white shadow-md shadow-primary/20" : "hover:bg-secondary/70 hover:text-primary"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <OptionChip selected={date === month.value} onClick={() => onPick(month.value)}>
            Any day in {month.value.split(" ")[0]}
          </OptionChip>
        </div>
      </>
    );
  }

  return (
    <>
      <StepTitle title="When's the big day?" hint="Pick the month, then the date" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {months.map((m) => (
          <OptionCard key={m.value} selected={!!date && date.endsWith(m.value)} onClick={() => setMonth(m)} className="text-center">
            <span className="block font-serif text-2xl">{m.month}</span>
            <span className="block text-xs text-muted">{m.year}</span>
          </OptionCard>
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <OptionChip selected={date === ""} onClick={() => onPick("")}>
          Not decided yet
        </OptionChip>
      </div>
    </>
  );
}

/* ───────────── 7. Vibe ───────────── */

/** Same services at every vibe; the vibe sets how far up each service's price range we go. */
export function VibeStep({
  card,
  selected,
  vibe,
  guests,
  eventCount,
  onPick,
}: {
  card: RateCard;
  selected: Set<string>;
  vibe: string | null;
  guests: number;
  eventCount: number;
  onPick: (id: string) => void;
}) {
  return (
    <>
      <StepTitle
        title="Pick your vibe"
        hint={`Same ${selected.size} services, priced at the level you want`}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {vibeOptions.map((v, i) => {
          const est = estimate(card, selected, guests, eventCount, v.band);
          return (
            <OptionCard key={v.id} selected={vibe === v.id} onClick={() => onPick(v.id)} className="p-6 text-center">
              <span className="flex justify-center">
                <IconBadge icon={v.icon} active={vibe === v.id} large />
              </span>
              <span className="mt-3 block font-serif text-3xl">{v.name}</span>
              <span className="mt-1 block text-sm text-muted">{v.note}</span>
              <span className="mt-4 block text-xs tracking-widest text-muted" aria-hidden>
                {"₹".repeat(i + 1)}
              </span>
              <span className="mt-1 block text-sm font-medium text-primary">{inrRange(est.min, est.max)}</span>
              {est.onRequest > 0 && <span className="block text-xs text-muted">+{est.onRequest} on request</span>}
            </OptionCard>
          );
        })}
      </div>
    </>
  );
}

export function LoadError({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <div role="alert" className="rounded-2xl border border-primary/20 bg-secondary/50 p-6 text-center">
      <p className="text-ink">{message ?? "We couldn't load our services just now."}</p>
      <button type="button" onClick={onRetry} className={buttonClasses("primary", "mt-4")}>
        Try again
      </button>
    </div>
  );
}

/* ───────────── 6. Services ───────────── */

export function ServicesStep({
  card,
  selected,
  onToggle,
  onReplace,
  onNext,
}: {
  card: RateCard;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onReplace: (ids: string[]) => void;
  onNext: () => void;
}) {
  const [active, setActive] = useState(0);
  const full = selected.size >= MAX_SERVICES;
  const category = card.categories[active] ?? card.categories[0];
  const levels = ["core", "addon", "luxury"] as const;

  return (
    <>
      <StepTitle title="Which services do you need?" hint="Start from a quick pick or tap to add and remove. Next, you'll pick the vibe." />

      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {servicePresets.map((p) => {
          const ids = idsForPreset(card, p.perCategory);
          const on = ids.length === selected.size && ids.every((id) => selected.has(id));
          return (
            <OptionChip key={p.label} selected={on} onClick={() => onReplace(ids)}>
              {p.label}
            </OptionChip>
          );
        })}
        {selected.size > 0 && (
          <button type="button" onClick={() => onReplace([])} className="px-3 text-sm text-muted hover:text-ink">
            Clear
          </button>
        )}
      </div>

      <p className={`-mt-3 mb-5 text-center text-xs ${full ? "font-medium text-primary" : "text-muted"}`} aria-live="polite">
        {selected.size} / {MAX_SERVICES} services picked
        {full && " · that's the max, remove one to add another"}
      </p>

      <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 scrollbar-none" role="tablist">
        {card.categories.map((c, i) => {
          const count = c.items.filter((item) => selected.has(item.id)).length;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition ${
                i === active
                  ? "border-ink bg-ink text-white"
                  : "border-ink/15 bg-white/60 text-ink backdrop-blur-sm hover:border-ink/40"
              }`}
            >
              {c.name}
              {count > 0 && (
                <span
                  className={`grid min-w-5 place-items-center rounded-full px-1.5 text-xs ${
                    i === active ? "bg-white text-ink" : "bg-primary text-white"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div key={category.id} className="step-in space-y-6" role="tabpanel">
        {levels.map((level) => {
          const items = category.items.filter((i) => i.level === level);
          if (items.length === 0) return null;
          return (
            <section key={level}>
              <h3 className="mb-3 flex items-center gap-2 font-sans text-xs font-medium tracking-widest text-muted uppercase">
                {level === "luxury" && <Crown className="size-4 text-amber-600" strokeWidth={1.75} aria-hidden />}
                {levelLabels[level]}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => {
                  const range = inrRange(item.min, item.max);
                  const isOn = selected.has(item.id);
                  return (
                    <OptionCard
                      key={item.id}
                      selected={isOn}
                      onClick={() => onToggle(item.id)}
                      className={full && !isOn ? "pointer-events-none opacity-40" : ""}
                    >
                      <span className="block pr-4 font-medium">{item.name}</span>
                      <span className="mt-1 block text-xs text-muted">
                        {range ? `${range} ${pricingLabels[item.pricing_type]}` : "Price on request"}
                      </span>
                    </OptionCard>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => setActive((a) => a - 1)}
          disabled={active === 0}
          className="font-medium text-muted hover:text-ink disabled:invisible"
        >
          ← {card.categories[active - 1]?.name}
        </button>
        <span className="text-xs text-muted">
          {active + 1} / {card.categories.length}
        </span>
        <button
          type="button"
          onClick={() => setActive((a) => a + 1)}
          disabled={active === card.categories.length - 1}
          className="font-medium text-primary disabled:invisible"
        >
          {card.categories[active + 1]?.name} →
        </button>
      </div>

      <ContinueButton onClick={onNext} disabled={selected.size === 0}>
        {selected.size === 0 ? "Pick at least one service" : `Continue with ${selected.size} service${selected.size > 1 ? "s" : ""}`}
      </ContinueButton>
    </>
  );
}
