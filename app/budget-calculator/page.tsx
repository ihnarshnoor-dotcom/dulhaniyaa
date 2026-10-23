import type { Metadata } from "next";
import Image from "next/image";
import { images } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { BudgetCalculator } from "@/components/budget/BudgetCalculator";

export const metadata: Metadata = {
  title: "Wedding Budget Calculator",
  description:
    "Tap through a few quick choices and get a personalised wedding plan and estimate: event-wise services, a timeline and a budget check.",
  alternates: { canonical: "/budget-calculator" },
};

export default function BudgetCalculatorPage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Soft, blurred wedding photo behind the calculator */}
      <div className="absolute inset-x-0 top-0 -z-10 h-136" aria-hidden>
        <Image
          src={images.hero.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover blur-2xl"
        />
        <div className="absolute inset-0 bg-linear-to-b from-ivory/40 via-ivory/70 to-ivory" />
      </div>

      <Container className="max-w-4xl pt-14 pb-24 sm:pt-20 sm:pb-32">
        <div className="mb-10 text-center">
          <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">Budget Calcy</p>
          <h1 className="hero-fade mt-3 text-5xl leading-[1.05] [animation-delay:100ms] sm:text-6xl">
            Plan your wedding in a few taps
          </h1>
          <p className="hero-fade mx-auto mt-4 max-w-md leading-relaxed text-muted [animation-delay:200ms]">
            Pick your events, guests and vibe. We&apos;ll build a personalised plan and estimate for you.
          </p>
        </div>

        <BudgetCalculator />
      </Container>
    </div>
  );
}
