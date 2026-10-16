import type { Metadata } from "next";
import Image from "next/image";
import { business, story, team } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "About Us: Meet the Team",
  description: `Meet the planners, designers, photographers and stylists behind ${business.name}, a wedding studio in Rajouri Garden, West Delhi.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero title="About us" />

      <section className="pb-24 sm:pb-32">
        <Container>
          <Reveal className="mx-auto max-w-2xl space-y-5 text-center text-lg leading-relaxed text-muted">
            {story.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="border-t border-ink/10 py-24 sm:py-32">
        <Container>
          <SectionHeading title="The team" />
          <Reveal stagger className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {team.map((m) => (
              <article key={m.name}>
                <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-secondary">
                  {m.photo ? (
                    <Image
                      src={m.photo.src}
                      alt={m.photo.alt}
                      fill
                      placeholder={m.photo.blurDataURL ? "blur" : "empty"}
                      blurDataURL={m.photo.blurDataURL}
                      style={{ objectPosition: m.photo.position }}
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    // Until a real photo is added, show the person's initials.
                    <div className="absolute inset-0 grid place-items-center" aria-hidden>
                      <div className="absolute -top-10 -left-10 size-40 rounded-full bg-primary/25 blur-3xl" />
                      <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-amber-300/40 blur-3xl" />
                      <span className="relative font-serif text-6xl text-primary">
                        {m.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-2xl">{m.name}</h3>
                <p className="text-sm text-muted">{m.role}</p>
              </article>
            ))}
          </Reveal>
        </Container>
      </section>

      <CtaBanner title="Come say hello" text="Visit our West Delhi studio, or send us an enquiry." />
    </>
  );
}
