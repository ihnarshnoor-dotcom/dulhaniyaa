import Image from "next/image";
import { images } from "@/data/site";
import { Button } from "./Button";
import { Container } from "./Container";

/** Temporary page body for sections that are still being written. */
export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <div className="relative isolate overflow-hidden rounded-4xl shadow-2xl shadow-primary/10">
          <Image src={images.hero.src} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="-z-10 scale-110 object-cover blur-md" />
          <div className="absolute inset-0 -z-10 bg-ink/30" />
          <div className="m-4 rounded-3xl border border-white/40 bg-white/60 px-6 py-14 text-center backdrop-blur-xl sm:m-10 sm:py-20">
            <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">Coming soon</p>
            <h1 className="mt-3 text-5xl leading-tight sm:text-6xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-sm leading-relaxed text-muted">{text}</p>
            <Button href="/budget-calculator" className="mt-8">
              Try the budget calculator
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
