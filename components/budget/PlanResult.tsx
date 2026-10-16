import Link from "next/link";
import type { ReactNode } from "react";
import { itemRefName, type Basics, type Plan } from "@/lib/facilitator";
import { inrRange, levelLabels } from "@/lib/budget";
import { buttonClasses } from "@/components/ui/Button";
import { Calculator, CircleCheck, Lightbulb, PiggyBank, Scissors, TriangleAlert } from "lucide-react";
import { CheckIcon } from "@/components/ui/Icons";
import { DownloadPlanButton } from "./DownloadPlanButton";

// Everything below is rendered as plain text: the wording comes from an AI.

const budgetStyles = {
  within: {
    label: "Within your budget",
    icon: CircleCheck,
    className: "border-emerald-600/20 bg-emerald-50/80",
    iconClass: "text-emerald-700",
  },
  under: { label: "Under your budget", icon: PiggyBank, className: "border-sky-600/20 bg-sky-50/80", iconClass: "text-sky-700" },
  over: { label: "Over your budget", icon: TriangleAlert, className: "border-amber-600/25 bg-amber-50/80", iconClass: "text-amber-700" },
  unknown: { label: "Budget check", icon: Calculator, className: "border-ink/10 bg-white/60", iconClass: "text-primary" },
};

const card = "rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-sm backdrop-blur-md sm:p-8";

function Section({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${card} ${className}`}>
      <h3 className="mb-4 text-2xl sm:text-3xl">{title}</h3>
      {children}
    </section>
  );
}

export function PlanResult({
  plan,
  basics,
  customerName,
  onEdit,
  onRestart,
}: {
  plan: Plan;
  basics: Basics;
  customerName?: string;
  onEdit: () => void;
  onRestart: () => void;
}) {
  const total = inrRange(plan.total_min, plan.total_max);
  const budget = plan.budget_check;
  const budgetStyle = budgetStyles[budget?.status ?? "unknown"] ?? budgetStyles.unknown;
  const trims = budget?.trim_suggestions?.filter(Boolean) ?? [];
  const onRequest = plan.on_request ?? [];
  const facts = [
    basics.events.join(" · "),
    basics.city,
    `${basics.guestCount.toLocaleString("en-IN")} guests`,
    basics.date,
  ].filter(Boolean);

  return (
    <div className="step-in space-y-5">
      {/* Headline */}
      <div className="text-center">
        <p className="text-xs font-medium tracking-widest text-primary uppercase">Your personalised plan & estimate</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {facts.map((f) => (
            <span key={f} className="rounded-full bg-secondary/70 px-3 py-1 text-xs text-primary-dark">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Total */}
      <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-center text-white sm:p-10">
        <div className="pointer-events-none absolute -top-20 -left-16 size-56 rounded-full bg-primary/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-24 size-56 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="relative">
          <p className="text-sm text-white/70">Estimated total</p>
          <p className="mt-2 font-serif text-4xl leading-tight sm:text-6xl">{total ?? "To be confirmed"}</p>
          {onRequest.length > 0 && (
            <p className="mt-3 text-sm text-white/70">
              + {onRequest.length} item{onRequest.length > 1 ? "s" : ""} priced on request
            </p>
          )}
        </div>
      </section>

      {/* Budget check */}
      {budget && (budget.message || budget.status !== "unknown") && (
        <section className={`rounded-3xl border p-6 backdrop-blur-md sm:p-8 ${budgetStyle.className}`}>
          <h3 className="flex items-center gap-2 text-2xl">
            <budgetStyle.icon className={`size-6 shrink-0 ${budgetStyle.iconClass}`} strokeWidth={1.75} aria-hidden />
            {budgetStyle.label}
          </h3>
          {budget.message && <p className="mt-2 leading-relaxed text-ink/80">{budget.message}</p>}
          {trims.length > 0 && (
            <>
              <p className="mt-4 text-sm font-medium">Ways to trim</p>
              <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
                {trims.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <Scissors className="mt-0.5 size-4 shrink-0 text-amber-700" strokeWidth={1.75} aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Summary */}
      {plan.summary && (
        <Section title="The big picture">
          <p className="leading-relaxed text-ink/80">{plan.summary}</p>
        </Section>
      )}

      {/* Events */}
      {plan.events && plan.events.length > 0 && (
        <Section title="Event by event">
          <div className="grid gap-4 sm:grid-cols-2">
            {plan.events.map((ev, i) => (
              <article key={i} className="rounded-2xl border border-ink/10 bg-ivory/70 p-5">
                <h4 className="font-serif text-2xl">{ev.name}</h4>
                {ev.notes && <p className="mt-1 text-sm text-muted">{ev.notes}</p>}
                {ev.services && ev.services.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {ev.services.map((s, i) => (
                      <li key={i} className="rounded-full bg-white px-3 py-1 text-xs text-ink/80 shadow-sm">
                        {itemRefName(s)}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* Categories */}
      {plan.categories && plan.categories.length > 0 && (
        <Section title="Category breakdown">
          <div className="grid gap-4 md:grid-cols-2">
            {plan.categories.map((cat, ci) => {
              const subtotal = inrRange(cat.subtotal_min, cat.subtotal_max);
              return (
                <article key={ci} className="flex flex-col rounded-2xl border border-ink/10 bg-ivory/70 p-5">
                  <h4 className="font-serif text-2xl">{cat.name}</h4>
                  <ul className="mt-3 flex-1 divide-y divide-ink/5">
                    {cat.items.map((item, ii) => (
                      <li key={ii} className="flex items-start justify-between gap-3 py-2 text-sm">
                        <span>
                          {item.name}
                          {item.level === "luxury" && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">
                              {levelLabels.luxury}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-right text-muted">
                          {inrRange(item.est_min, item.est_max) ?? "Price on request"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {subtotal && cat.subtotal_max ? (
                    <p className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-sm font-medium">
                      <span>Subtotal</span>
                      <span className="text-primary">{subtotal}</span>
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </Section>
      )}

      {/* On request */}
      {onRequest.length > 0 && (
        <Section title="Price on request">
          <p className="mb-3 text-sm text-muted">Our planner will get you a quote for these.</p>
          <ul className="flex flex-wrap gap-2">
            {onRequest.map((r, i) => (
              <li key={i} className="rounded-full border border-ink/10 bg-ivory px-4 py-1.5 text-sm">
                {itemRefName(r)}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Timeline */}
      {plan.timeline && plan.timeline.length > 0 && (
        <Section title="Your timeline">
          <ol className="relative space-y-5 border-l-2 border-secondary pl-6">
            {plan.timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute top-1.5 -left-[31px] size-3 rounded-full bg-primary ring-4 ring-secondary" />
                <p className="text-xs font-medium tracking-wide text-primary uppercase">{t.when}</p>
                <p className="mt-0.5 text-ink/80">{t.task}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {plan.suggestions && plan.suggestions.length > 0 && (
          <Section title="Ideas to consider">
            <ul className="space-y-2.5 text-sm text-ink/80">
              {plan.suggestions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        )}
        {plan.permissions_checklist && plan.permissions_checklist.length > 0 && (
          <Section title="Permissions checklist">
            <ul className="space-y-2.5 text-sm text-ink/80">
              {plan.permissions_checklist.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <CheckIcon width={16} height={16} className="mt-0.5 shrink-0 text-primary" />
                  {p}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <p className="rounded-2xl bg-secondary/50 px-5 py-4 text-center text-sm text-primary-dark">
        {plan.disclaimer || "Personalised plan and estimate. Final quote confirmed by our planner."}
      </p>

      <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:items-start">
        <Link href="/contact" className={buttonClasses("primary")}>
          Talk to a planner
        </Link>
        <DownloadPlanButton plan={plan} basics={basics} customerName={customerName} />
        <button type="button" onClick={onEdit} className={buttonClasses("secondary")}>
          Edit my choices
        </button>
        <button type="button" onClick={onRestart} className="px-4 py-3 text-sm text-muted hover:text-ink">
          Start over
        </button>
      </div>
    </div>
  );
}
