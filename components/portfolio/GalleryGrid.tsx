"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gallery, galleryCategories } from "@/data/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Lightbox } from "./Lightbox";

type Filter = (typeof galleryCategories)[number];

export function GalleryGrid() {
  const [filter, setFilter] = useState<Filter>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  const photos = filter === "All" ? gallery : gallery.filter((p) => p.category === filter);

  const close = useCallback(() => setOpenIndex(null), []);
  // Close the lightbox if Next.js hides this page in the background.
  useLayoutEffect(() => close, [close]);

  // Fade photos in whenever the filter changes
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-photo]", {
          autoAlpha: 0,
          y: 24,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.05,
        });
      });
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: grid, dependencies: [filter] },
  );

  return (
    <>
      <div
        role="tablist"
        aria-label="Filter photos by event"
        className="-mx-4 mb-10 flex gap-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
      >
        {galleryCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={filter === cat}
            onClick={() => setFilter(cat)}
            className={`min-h-11 shrink-0 px-4 text-sm transition-colors ${
              filter === cat ? "text-primary underline underline-offset-8" : "text-muted hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CSS columns create the masonry layout without any extra library */}
      <div ref={grid} className="columns-2 gap-3 sm:gap-5 lg:columns-3">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            data-photo
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl sm:mb-5 sm:rounded-3xl"
            aria-label={`Open photo: ${photo.alt}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              placeholder={photo.blurDataURL ? "blur" : "empty"}
              blurDataURL={photo.blurDataURL}
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <span className="absolute bottom-3 left-3 rounded-full bg-ivory/80 px-3 backdrop-blur-sm py-1 text-[0.7rem] text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {photo.category}
            </span>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox photos={photos} index={openIndex} onClose={close} onChange={setOpenIndex} />
      )}
    </>
  );
}
