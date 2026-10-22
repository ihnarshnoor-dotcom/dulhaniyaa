import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { b2b, business } from "@/data/site";
import { partnerBasics, vendorPages } from "@/data/vendors";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CheckIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

// One page per service, all built at build time. Any other slug shows the 404 page.
export function generateStaticParams() {
  return b2b.services.filter((s) => vendorPages[s.slug]).map((s) => ({ slug: s.slug }));
}

function find(slug: string) {
  const service = b2b.services.find((s) => s.slug === slug);
  const page = vendorPages[slug];
  return service && page ? { service, page } : null;
}

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const found = find((await params).slug);
  if (!found) return {};
  return {
    title: `${found.service.name} Partners`,
    description: `See the ${found.service.name.toLowerCase()} work ${business.name} does and enquire about becoming a partner.`,
    alternates: { canonical: `/vendors/${found.service.slug}` },
    robots: { index: false },
  };
}

// The page shell renders at once; the service content (which depends on the URL) fills in behind
// the placeholder. Links to these pages use prefetch, so it is usually ready before the click.
export default function VendorServicePage({ params }: PageProps<"/vendors/[slug]">) {
  return (
    <Suspense fallback={<ServiceSkeleton />}>
      <ServiceContent params={params} />
    </Suspense>
  );
}

function ServiceSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Container className="pt-12 pb-24 sm:pt-16">
        <div className="shimmer h-4 w-28 rounded-full" />
        <div className="mt-6 grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <div className="space-y-4">
            <div className="shimmer h-3 w-32 rounded-full" />
            <div className="shimmer h-14 w-3/4 rounded-2xl" />
            <div className="shimmer h-20 rounded-2xl" />
            <div className="shimmer h-12 w-40 rounded-full" />
          </div>
          <div className="shimmer aspect-4/3 rounded-4xl" />
        </div>
      </Container>
    </div>
  );
}

async function ServiceContent({ params }: Pick<PageProps<"/vendors/[slug]">, "params">) {
  const found = find((await params).slug);
  if (!found) notFound();
  const { service, page } = found;
  const others = b2b.services.filter((s) => s.slug !== service.slug && vendorPages[s.slug]);

  return (
    <>
      {/* Intro */}
      <section className="pt-12 pb-14 sm:pt-16 sm:pb-20">
        <Container>
          <Link href="/vendors" className="text-sm text-muted transition-colors hover:text-primary">
            ← All services
          </Link>
          <div className="mt-6 grid items-center gap-8 md:grid-cols-2 md:gap-14">
            <div>
              <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">Partner with us</p>
              <h1 className="hero-fade mt-3 text-5xl leading-[1.05] [animation-delay:100ms] sm:text-6xl">{service.name}</h1>
              <p className="hero-fade mt-5 max-w-md leading-relaxed text-muted [animation-delay:200ms]">{service.text}</p>
              <div className="hero-fade mt-8 [animation-delay:250ms]">
                <Button href={`/contact?purpose=vendor:${service.slug}`}>Enquire now</Button>
              </div>
            </div>
            <div className="hero-fade relative aspect-4/3 overflow-hidden rounded-4xl shadow-2xl shadow-primary/10 [animation-delay:150ms]">
              <Image
                src={service.image.src}
                alt={service.image.alt}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                placeholder={service.image.blurDataURL ? "blur" : "empty"}
                blurDataURL={service.image.blurDataURL}
                style={{ objectPosition: service.image.position }}
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* What we've done */}
      <section aria-labelledby="work-heading" className="pb-16 sm:pb-24">
        <Container>
          <Reveal>
            <h2 id="work-heading" className="text-4xl sm:text-5xl">
              Our {service.name.toLowerCase()} work
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {page.work.map((item) => (
                <li key={item} className="flex gap-3 rounded-2xl border border-ink/10 bg-white/60 p-5 leading-relaxed text-muted">
                  <CheckIcon width={20} height={20} className="mt-0.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal stagger className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {page.gallery.map((photo) => (
              <div key={photo.src} className="relative aspect-3/4 overflow-hidden rounded-2xl shadow-md shadow-ink/5 sm:rounded-3xl">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  placeholder={photo.blurDataURL ? "blur" : "empty"}
                  blurDataURL={photo.blurDataURL}
                  style={{ objectPosition: photo.position }}
                  className="object-cover"
                />
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* What we look for + enquire */}
      <section aria-labelledby="partners-heading" className="pb-20 sm:pb-28">
        <Container className="max-w-3xl">
          <Reveal className="rounded-4xl border border-ink/10 bg-white/50 p-8 sm:p-12">
            <h2 id="partners-heading" className="text-3xl sm:text-4xl">
              What we look for in {service.name.toLowerCase()} partners
            </h2>
            <ul className="mt-6 space-y-3">
              {[...page.lookingFor, ...partnerBasics].map((item) => (
                <li key={item} className="flex gap-3 text-muted">
                  <CheckIcon width={20} height={20} className="mt-0.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button href={`/contact?purpose=vendor:${service.slug}`} className="mt-8">
              Enquire now
            </Button>
          </Reveal>
        </Container>
      </section>

      {/* Other services */}
      <section aria-labelledby="others-heading" className="pb-24 sm:pb-32">
        <Container>
          <h2 id="others-heading" className="text-center text-sm font-medium tracking-[0.2em] text-muted uppercase">
            Other services
          </h2>
          <nav className="mt-4 flex flex-wrap justify-center gap-2">
            {others.map((s) => (
              <Link key={s.slug} href={`/vendors/${s.slug}`} prefetch className="rounded-full bg-secondary/60 px-4 py-2 text-sm text-primary transition-colors hover:bg-secondary">
                {s.name}
              </Link>
            ))}
          </nav>
        </Container>
      </section>
    </>
  );
}
