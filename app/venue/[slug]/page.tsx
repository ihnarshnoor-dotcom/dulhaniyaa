import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { BedDouble, Check, MapPin, Phone, Users, X } from "lucide-react";
import { business } from "@/data/site";
import { findVenue, inrFull, inrShort, venueAmenities, venues } from "@/data/venues";
import { whatsappLink } from "@/lib/whatsapp";
import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { buttonClasses } from "@/components/ui/Button";
import { RatingBadge, VenueCard, venueHeroName, venueTitleName } from "@/components/venue/VenueCard";
import { VenuePlaceholder } from "@/components/venue/VenueIcon";

// One page per venue, all built at build time. Any other slug shows the 404 page.
export function generateStaticParams() {
  return venues.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/venue/[slug]">): Promise<Metadata> {
  const venue = findVenue((await params).slug);
  if (!venue) return {};
  return {
    title: `${venue.name}, ${venue.area}`,
    description: venue.short,
    alternates: { canonical: `/venue/${venue.slug}` },
  };
}

// Same pattern as the vendor pages: the shell renders at once and the venue fills in behind the placeholder.
export default function VenueDetailPage({ params }: PageProps<"/venue/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      {/* Opening from a card: the page "snaps" in behind the tile that grows into the hero (see globals.css). */}
      <ViewTransition
        enter={{ "venue-open": "venue-arrive", default: "none" }}
        exit={{ "venue-open": "venue-recede", "venue-close": "venue-leave", default: "none" }}
        default="none"
      >
        <VenueDetail params={params} />
      </ViewTransition>
    </Suspense>
  );
}

function DetailSkeleton() {
  return (
    <Container className="max-w-7xl pt-10 pb-24" >
      <div aria-busy="true" aria-label="Loading" className="space-y-6">
        <div className="shimmer h-4 w-28 rounded-full" />
        <div className="shimmer aspect-video rounded-4xl md:aspect-21/9" />
        <div className="shimmer h-12 w-2/3 rounded-2xl" />
        <div className="shimmer h-24 rounded-2xl" />
      </div>
    </Container>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-3xl">{children}</h2>;
}

async function VenueDetail({ params }: Pick<PageProps<"/venue/[slug]">, "params">) {
  const venue = findVenue((await params).slug);
  if (!venue) notFound();

  const enquiry = whatsappLink(
    `Hi Dulhaniyaa! I'm interested in ${venue.name} (${venue.area}, ${venue.city}). Could you check availability for my dates?`,
  );
  const similar = venues
    .filter((v) => v.slug !== venue.slug && (v.city === venue.city || v.type === venue.type))
    .slice(0, 3);

  const facts = [
    { label: "Guests", value: `${venue.capacity.min.toLocaleString("en-IN")} – ${venue.capacity.max.toLocaleString("en-IN")}` },
    { label: "Veg per plate", value: inrFull(venue.vegPrice) },
    { label: "Non-veg per plate", value: inrFull(venue.nonVegPrice) },
    { label: "Rooms", value: venue.rooms > 0 ? String(venue.rooms) : "None" },
    { label: "Space", value: venue.setting },
    { label: "Venue rent", value: venue.rentalFrom ? `from ${inrShort(venue.rentalFrom)}` : "Included" },
  ];

  return (
    <article className="pt-8 pb-24 sm:pt-12 sm:pb-32">
      <Container className="max-w-7xl">
        <Link href="/venue" transitionTypes={["venue-close"]} className="text-sm font-medium text-muted hover:text-primary">
          ← All venues
        </Link>

        {/* Gallery placeholder: one big tile and two small ones until photos arrive */}
        <div className="mt-5 grid gap-3 md:grid-cols-3 md:grid-rows-2">
          <ViewTransition name={venueHeroName(venue.slug)} share="venue-hero" default="none">
            <VenuePlaceholder type={venue.type} size="lg" className="aspect-video rounded-4xl md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-112" />
          </ViewTransition>
          <VenuePlaceholder type={venue.type} className="hidden rounded-3xl opacity-80 md:grid" />
          <div className="relative hidden overflow-hidden rounded-3xl md:block">
            <VenuePlaceholder type={venue.type} className="h-full opacity-60" />
            <span className="absolute inset-0 grid place-items-center text-sm font-medium text-primary-dark">Photos coming soon</span>
          </div>
        </div>

        {/* Title */}
        <header className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">{venue.type}</p>
            <ViewTransition name={venueTitleName(venue.slug)} share="venue-zoom" default="none">
              <h1 className="mt-2 w-fit text-5xl leading-[1.05] sm:text-6xl">{venue.name}</h1>
            </ViewTransition>
            <p className="mt-2 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" strokeWidth={1.75} aria-hidden />
              {venue.area}, {venue.city}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <RatingBadge rating={venue.rating} />
            {venue.reviews} reviews
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
          <div className="space-y-12">
            {/* Quick facts */}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                  <dt className="text-xs text-muted">{f.label}</dt>
                  <dd className="mt-1 font-serif text-2xl">{f.value}</dd>
                </div>
              ))}
            </dl>

            <section>
              <SectionTitle>About the venue</SectionTitle>
              <p className="leading-relaxed text-muted">{venue.about}</p>
            </section>

            <section>
              <SectionTitle>Spaces</SectionTitle>
              <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/60">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-ink/10 text-xs text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Space</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Seated</th>
                      <th className="px-4 py-3 font-medium">Floating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venue.spaces.map((s) => (
                      <tr key={s.name} className="border-b border-ink/5 last:border-0">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-muted">{s.setting}</td>
                        <td className="px-4 py-3">{s.seated.toLocaleString("en-IN")}</td>
                        <td className="px-4 py-3">{s.floating.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <SectionTitle>Amenities</SectionTitle>
              <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {venueAmenities.map((a) => {
                  const has = venue.amenities.includes(a);
                  return (
                    <li key={a} className={`flex items-center gap-2.5 text-sm ${has ? "" : "text-muted/60 line-through"}`}>
                      {has ? (
                        <Check className="size-4 shrink-0 text-emerald-700" aria-label="Available" />
                      ) : (
                        <X className="size-4 shrink-0" aria-label="Not available" />
                      )}
                      {a}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <SectionTitle>Policies</SectionTitle>
              <dl className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/60">
                {venue.policies.map((p) => (
                  <div key={p.label} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[180px_1fr]">
                    <dt className="text-muted">{p.label}</dt>
                    <dd>{p.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* Price + enquiry */}
          <aside className="lg:order-last">
            <div className="sticky top-28 rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-sm">
              <p className="text-xs text-muted">Starting from</p>
              <p className="mt-1 font-serif text-4xl">
                {inrFull(venue.vegPrice)}
                <span className="ml-1 font-sans text-sm text-muted">/ plate veg</span>
              </p>
              <p className="mt-1 text-sm text-muted">{inrFull(venue.nonVegPrice)} / plate non-veg</p>

              <ul className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-sm">
                <li className="flex items-center gap-2">
                  <Users className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
                  Up to {venue.capacity.max.toLocaleString("en-IN")} guests
                </li>
                {venue.rooms > 0 && (
                  <li className="flex items-center gap-2">
                    <BedDouble className="size-4 text-primary" strokeWidth={1.75} aria-hidden />
                    {venue.rooms} rooms on site
                  </li>
                )}
              </ul>

              <a href={enquiry} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "mt-6 w-full")}>
                <WhatsAppIcon width={18} height={18} />
                Check availability
              </a>
              <a href={`tel:${business.phoneHref}`} className={buttonClasses("secondary", "mt-3 w-full")}>
                <Phone className="size-4" strokeWidth={1.75} aria-hidden />
                Call us
              </a>
              <p className="mt-4 text-center text-xs text-muted">Free to ask. We&apos;ll confirm dates and the best price.</p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-20">
            <SectionTitle>Similar venues</SectionTitle>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((v) => (
                <VenueCard key={v.slug} venue={v} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </article>
  );
}
