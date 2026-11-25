import Link from "next/link";
import { ViewTransition } from "react";
import { MapPin, Star, Users } from "lucide-react";
import { inrFull, type Venue } from "@/data/venues";
import { VenuePlaceholder } from "./VenueIcon";

/**
 * Shared names for the card → venue page "zoom" (see the view-transition rules in globals.css).
 * The card's icon tile and title morph into the hero tile and heading on the venue page.
 */
export const venueHeroName = (slug: string) => `venue-hero-${slug}`;
export const venueTitleName = (slug: string) => `venue-title-${slug}`;

export function RatingBadge({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-semibold text-white">
      <Star className="size-3 fill-current" strokeWidth={0} aria-hidden />
      {rating.toFixed(1)}
      {reviews != null && <span className="font-normal text-white/80">({reviews})</span>}
      <span className="sr-only"> out of 5</span>
    </span>
  );
}

/** One venue in the listing grid. The whole card opens the venue's page. */
export function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      href={`/venue/${venue.slug}`}
      transitionTypes={["venue-open"]}
      className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white/70 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative">
        <ViewTransition name={venueHeroName(venue.slug)} share="venue-hero" default="none">
          <VenuePlaceholder type={venue.type} className="aspect-4/3 rounded-t-3xl transition duration-500 group-hover:scale-[1.03]" />
        </ViewTransition>
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink shadow-sm">
          {venue.type}
        </span>
        {venue.popular && (
          <span className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm">
            Popular
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <ViewTransition name={venueTitleName(venue.slug)} share="venue-zoom" default="none">
            <h3 className="font-serif text-2xl leading-tight group-hover:text-primary">{venue.name}</h3>
          </ViewTransition>
          <RatingBadge rating={venue.rating} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          {venue.area}, {venue.city}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{venue.short}</p>

        <dl className="mt-auto grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted">Veg per plate</dt>
            <dd className="font-medium">{inrFull(venue.vegPrice)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted">
              <Users className="size-3" strokeWidth={1.75} aria-hidden />
              Guests
            </dt>
            <dd className="font-medium">
              {venue.capacity.min.toLocaleString("en-IN")} – {venue.capacity.max.toLocaleString("en-IN")}
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
