import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { WeddingPlanner } from "@/components/planner/WeddingPlanner";

export const metadata: Metadata = {
  title: "Plan My Wedding",
  description:
    "Tap through the events of an Indian wedding (roka, haldi, mehendi, sangeet, pheras and reception) and learn what happens at each, then get a quote.",
  alternates: { canonical: "/plan-my-wedding" },
};

export default function PlanMyWeddingPage() {
  return (
    <section className="pt-14 pb-24 sm:pt-20 sm:pb-32">
      <Container>
        <div className="mb-10 text-center">
          <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">Plan my wedding</p>
          <h1 className="hero-fade mt-3 text-5xl leading-[1.05] [animation-delay:100ms] sm:text-6xl">What will your wedding look like?</h1>
          <p className="hero-fade mx-auto mt-4 max-w-md leading-relaxed text-muted [animation-delay:200ms]">
            Tap a question and our planner explains each event, what happens and what to plan for.
          </p>
        </div>
        <WeddingPlanner />
      </Container>
    </section>
  );
}
