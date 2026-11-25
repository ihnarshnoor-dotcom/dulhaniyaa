import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Container } from "@/components/ui/Container";
import { VenueListing } from "@/components/venue/VenueListing";

export const metadata: Metadata = {
  title: "Wedding Venues",
  description:
    "Farmhouses, banquets, hotels, lawns, resorts and palaces. Filter by city, guest count, price per plate and amenities, then check availability.",
  alternates: { canonical: "/venue" },
};

export default function VenuePage() {
  return (
    // Opening a venue zooms this page past the viewer; coming back zooms it into place (see globals.css).
    <ViewTransition
      enter={{ "venue-close": "venue-return", default: "none" }}
      exit={{ "venue-open": "venue-recede", default: "none" }}
      default="none"
    >
      <section className="pt-6 pb-24 sm:pt-8 sm:pb-32">
        <Container className="max-w-7xl">
          <div className="mb-10 text-center">
            <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">
              Venue
            </p>
            <h1 className="hero-fade mt-3 text-5xl leading-[1.05] [animation-delay:100ms] sm:text-6xl">
              Find the perfect venue
            </h1>
            <p className="hero-fade mx-auto mt-4 max-w-md leading-relaxed text-muted [animation-delay:200ms]">
              Farmhouses, banquets, hotels and palaces. Filter by city, guests
              and budget, then tap one to see everything.
            </p>
          </div>
          <VenueListing />
        </Container>
      </section>
    </ViewTransition>
  );
}
