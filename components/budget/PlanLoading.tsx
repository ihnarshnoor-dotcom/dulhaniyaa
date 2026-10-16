"use client";

import { useEffect, useState } from "react";
import { Gem } from "lucide-react";

const messages = [
  "Planning your celebration…",
  "Tasting the chaat counters…",
  "Tuning the dhol…",
  "Counting the marigolds…",
  "Checking the muhurat…",
  "Lining up the baraat…",
  "Adding up the numbers…",
];

export function PlanLoading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="step-in py-6 text-center" role="status" aria-live="polite">
      <div className="relative mx-auto size-20">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-secondary border-t-primary motion-reduce:animate-none" />
        <span className="absolute inset-0 grid place-items-center text-primary" aria-hidden>
          <Gem className="size-8" strokeWidth={1.5} />
        </span>
      </div>
      <p key={index} className="step-in mt-6 font-serif text-2xl sm:text-3xl">
        {messages[index]}
      </p>
      <p className="mt-2 text-sm text-muted">Your personalised plan takes a few seconds.</p>

      <div className="mt-10 grid gap-4 text-left sm:grid-cols-3" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-ink/5 bg-white/50 p-5">
            <div className="shimmer h-4 w-1/2 rounded-full" />
            <div className="shimmer h-3 w-full rounded-full" />
            <div className="shimmer h-3 w-4/5 rounded-full" />
            <div className="shimmer h-6 w-2/3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
