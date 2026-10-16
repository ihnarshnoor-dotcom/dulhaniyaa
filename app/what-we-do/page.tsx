import type { Metadata } from "next";
import Image from "next/image";
import { gallery, serviceGroups, whatWeDoHero, type Photo } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GroupNav } from "@/components/what-we-do/GroupNav";
import { ScrollEffects } from "@/components/what-we-do/ScrollEffects";

export const metadata: Metadata = {
  title: "What We Do: Venue, Décor, Food, Entertainment & More",
  description:
    "Venue and décor, food, bar and guest stay, entertainment and baraat, bridal makeup, photography, invitations and permissions. Every part of your wedding, handled by one team.",
  alternates: { canonical: "/what-we-do" },
};

const totalServices = serviceGroups.reduce((sum, g) => sum + g.categories.reduce((n, c) => n + c.items.length, 0), 0);

function Framed({ photo, sizes, className = "" }: { photo: Photo; sizes: string; className?: string }) {
  return (
    <div data-parallax className={`relative overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/10 ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        placeholder={photo.blurDataURL ? "blur" : "empty"}
        blurDataURL={photo.blurDataURL}
        style={{ objectPosition: photo.position }}
        className="object-cover"
      />
    </div>
  );
}

function PhotoStrip({ photos, direction }: { photos: Photo[]; direction: "left" | "right" }) {
  return (
    <div data-strip={direction} className="flex w-max gap-3 sm:gap-5">
      {photos.map((p) => (
        <div key={p.src} className="relative h-36 shrink-0 overflow-hidden rounded-2xl sm:h-56 sm:rounded-3xl">
          <Image
            src={p.src}
            alt=""
            width={p.width}
            height={p.height}
            sizes="(min-width: 640px) 400px, 260px"
            placeholder={p.blurDataURL ? "blur" : "empty"}
            blurDataURL={p.blurDataURL}
            className="h-full w-auto"
          />
        </div>
      ))}
    </div>
  );
}

export default function WhatWeDoPage() {
  const half = Math.ceil(gallery.length / 2);

  return (
    <ScrollEffects>
      {/* Intro */}
      <section className="pt-16 sm:pt-24">
        <Container className="text-center">
          <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">What we do</p>
          <h1 className="hero-fade mx-auto mt-3 max-w-3xl text-5xl leading-[1.05] [animation-delay:100ms] sm:text-7xl">
            Every detail, one team
          </h1>
          <p className="hero-fade mx-auto mt-5 max-w-lg leading-relaxed text-muted [animation-delay:200ms]">
            {totalServices}+ services across four parts of your wedding. Book us for everything, or just the pieces you
            need.
          </p>
        </Container>
        <Container className="hero-fade mt-12 [animation-delay:300ms] sm:mt-16">
          <Framed photo={whatWeDoHero} sizes="(min-width: 1152px) 1104px, 100vw" className="aspect-2/1 sm:aspect-3/1" />
        </Container>
      </section>

      {/* Groups, with the menu sticking to the top while they scroll past */}
      <div className="mt-16 pb-24 sm:mt-24 sm:pb-32">
        <GroupNav groups={serviceGroups.map(({ id, title }) => ({ id, title }))} />
        <div className="space-y-24 pt-10 sm:space-y-36">
          {serviceGroups.map((group, gi) => (
            <section key={group.id} id={group.id} className="scroll-mt-40">
              <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                {/* Photo stays in view while the list scrolls past on large screens */}
                <div className={`lg:col-span-5 ${gi % 2 === 1 ? "lg:order-last" : ""}`}>
                  <div className="lg:sticky lg:top-44">
                    <Framed photo={group.image} sizes="(min-width: 1024px) 40vw, 100vw" className="aspect-3/2" />
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div data-reveal>
                    <p className="font-serif text-6xl text-primary/25 sm:text-7xl">{String(gi + 1).padStart(2, "0")}</p>
                    <h2 className="-mt-4 text-4xl leading-tight sm:-mt-6 sm:text-5xl">{group.title}</h2>
                    <p className="mt-4 max-w-lg leading-relaxed text-muted">{group.intro}</p>
                  </div>

                  <div className="mt-10 space-y-5">
                    {group.categories.map((cat) => (
                      <article
                        key={cat.name}
                        data-reveal
                        className="rounded-3xl border border-ink/10 bg-white/60 p-6 backdrop-blur-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10 sm:p-7"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <h3 className="text-2xl sm:text-3xl">{cat.name}</h3>
                          <span className="shrink-0 text-xs text-muted">
                            {cat.items.length} {cat.items.length === 1 ? "service" : "services"}
                          </span>
                        </div>
                        <ul data-stagger className="mt-4 flex flex-wrap gap-2">
                          {cat.items.map((item) => (
                            <li
                              key={item}
                              className="rounded-full border border-ink/10 bg-ivory px-3.5 py-1.5 text-sm text-ink/80 transition-colors hover:border-primary/40 hover:bg-secondary/60 hover:text-primary-dark"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          ))}
        </div>
      </div>

      {/* Moving photo strips */}
      <section aria-hidden className="space-y-3 overflow-hidden py-6 sm:space-y-5">
        <PhotoStrip photos={gallery.slice(0, half)} direction="left" />
        <PhotoStrip photos={gallery.slice(half)} direction="right" />
      </section>

      {/* Call to action */}
      <section className="py-24 sm:py-32">
        <Container>
          <div
            data-reveal
            className="relative isolate overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white sm:py-20"
          >
            <div className="absolute -top-24 -left-16 -z-10 size-72 rounded-full bg-primary/60 blur-3xl" />
            <div className="absolute -right-16 -bottom-28 -z-10 size-72 rounded-full bg-amber-400/30 blur-3xl" />
            <h2 className="text-4xl leading-tight sm:text-5xl">See what your wedding would cost</h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-white/70">
              Pick your events and services in a few taps and get a personalised plan and estimate.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/budget-calculator">Plan my budget</Button>
              <Button href="/contact" variant="secondary">
                Talk to us
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </ScrollEffects>
  );
}
