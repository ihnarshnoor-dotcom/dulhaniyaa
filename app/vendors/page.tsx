import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { b2b, business } from "@/data/site";
import { partnerBasics, vendorPages } from "@/data/vendors";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CheckIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Partner With Us: Wedding Vendors",
  description: `Wedding businesses: see the work ${business.name} does in décor, photography, catering, bars and more, and enquire about partnering with us.`,
  alternates: { canonical: "/vendors" },
  // Keep it out of search results until B2B launches.
  robots: { index: false },
};

export default function VendorsPage() {
  return (
    <>
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16">
        <Container className="text-center">
          <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">For vendors</p>
          <h1 className="hero-fade mx-auto mt-3 max-w-3xl text-5xl leading-[1.05] [animation-delay:100ms] sm:text-7xl">
            Grow with {business.name}
          </h1>
          <p className="hero-fade mx-auto mt-5 max-w-lg leading-relaxed text-muted [animation-delay:200ms]">
            We plan weddings across Delhi NCR and work with trusted partners in every service. Pick your service to see the work
            we do, then enquire to join us.
          </p>
          <div className="hero-fade mt-8 [animation-delay:250ms]">
            <Button href="/contact?purpose=vendor:other">Enquire now</Button>
          </div>
        </Container>
      </section>

      <section aria-labelledby="services-heading" className="pb-20 sm:pb-28">
        <Container>
          <h2 id="services-heading" className="sr-only">
            Services
          </h2>
          <Reveal stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {b2b.services
              .filter((s) => vendorPages[s.slug])
              .map((s) => (
                <Link
                  key={s.slug}
                  href={`/vendors/${s.slug}`}
                  prefetch
                  className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white/60 shadow-md shadow-ink/5 transition-shadow hover:shadow-2xl hover:shadow-primary/15"
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={s.image.src}
                      alt={s.image.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      placeholder={s.image.blurDataURL ? "blur" : "empty"}
                      blurDataURL={s.image.blurDataURL}
                      style={{ objectPosition: s.image.position }}
                      className="object-cover transition duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-serif text-2xl">{s.name}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{s.text}</p>
                    <span className="mt-4 text-sm font-medium text-primary">See our {s.name} work →</span>
                  </div>
                </Link>
              ))}
          </Reveal>
        </Container>
      </section>

      <section className="pb-24 sm:pb-32">
        <Container className="max-w-3xl">
          <div className="rounded-4xl border border-ink/10 bg-white/50 p-8 text-center sm:p-12">
            <h2 className="text-3xl sm:text-4xl">What we look for in every partner</h2>
            <ul className="mx-auto mt-6 max-w-md space-y-3 text-left">
              {partnerBasics.map((item) => (
                <li key={item} className="flex gap-3 text-muted">
                  <CheckIcon width={20} height={20} className="mt-0.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button href="/contact?purpose=vendor:other" className="mt-8">
              Enquire now
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
