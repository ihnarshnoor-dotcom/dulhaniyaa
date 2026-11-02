"use client";

import Image from "next/image";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { Photo } from "@/data/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { PhotoPreview } from "./PhotoPreview";

/** `thumbSrc`: a smaller file for one-cell and portrait tiles; large tiles and the preview use `src`. */
export type BentoPhoto = Photo & { category?: string; thumbSrc?: string };

/**
 * Landscape photos at these positions (repeating every 18 tiles) are shown
 * large. The dense grid then scatters them: on 4 columns they land left,
 * centre, right, left…, and on 3 columns they never stack on each other.
 */
const FEATURE_CYCLE = 18;
const FEATURE_AT = new Set([0, 10, 16]);

/** Tiles near the top of the page whose photos load straight away (pass as `eager`). */
export const ABOVE_THE_FOLD = 6;

/**
 * Tile size follows the photo's shape so as little as possible is cropped.
 * One grid cell is roughly 3:2.
 */
function tileClass(photo: Photo, i: number, total: number, uniform: boolean) {
  if (uniform) return "";
  const ratio = photo.width / photo.height;
  if (ratio < 0.85) return "row-span-2"; // portrait
  if (ratio >= 2.4) return "col-span-2"; // panorama / side-by-side collage
  // Skip a feature near the end, where too few photos are left to fill around it.
  if (ratio >= 1.35 && ratio < 1.95 && FEATURE_AT.has(i % FEATURE_CYCLE) && i + 4 < total)
    return "col-span-2 row-span-2"; // feature
  return "";
}

// Tilt and light only for mouse users who haven't asked for less motion.
const canTilt = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches;

export function tilt(e: PointerEvent<HTMLButtonElement>) {
  if (!canTilt()) return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
  el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
  el.style.setProperty("--gx", `${x * 100}%`);
  el.style.setProperty("--gy", `${y * 100}%`);
}

export function untilt(e: PointerEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

const subscribeNothing = () => () => {};

/** True while React hydrates server HTML, false when the component is first rendered in the browser. */
const useHydrating = () =>
  useSyncExternalStore(
    subscribeNothing,
    () => false,
    () => true,
  );

export function PhotoBento({
  photos,
  actions,
  previewActions,
  uniform = false,
  eager = 0,
}: {
  photos: BentoPhoto[];
  /** Every tile one cell, ignoring photo shapes (used while the shapes are still unknown). */
  uniform?: boolean;
  /** How many tiles from the top load their image straight away; the rest load as they near the screen. */
  eager?: number;
  /** Buttons on the tile's top-right corner, e.g. save and share. */
  actions?: (index: number) => ReactNode;
  /** Buttons beside the photo in the full-screen preview. */
  previewActions?: (index: number) => ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const lastOpened = useRef<HTMLButtonElement | null>(null);
  // Tiles in the server HTML are on screen before this code runs: hiding them to animate them in would make them blink.
  const hydrating = useHydrating();
  const fromServer = useRef(hydrating);

  const close = useCallback(() => {
    setOpenIndex(null);
    // Put keyboard focus back on the photo that was opened.
    requestAnimationFrame(() => lastOpened.current?.focus({ preventScroll: true }));
  }, []);

  // Close the preview if Next.js hides this page in the background.
  useLayoutEffect(() => () => setOpenIndex(null), []);

  const tiles = photos.map((photo, i) => tileClass(photo, i, photos.length, uniform));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Only tiles not animated yet, so photos added by "Load more" rise in without replaying the rest.
        gsap.utils.toArray<HTMLElement>("[data-tile]:not([data-shown])").forEach((tile) => {
          tile.dataset.shown = "";
          if (fromServer.current && tile.getBoundingClientRect().top < window.innerHeight) return;
          gsap.from(tile, {
            autoAlpha: 0,
            y: 40,
            scale: 0.94,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: tile, start: "top 92%", once: true },
          });
        });
      });
      fromServer.current = false;
      // Tiles may have moved (new photos, or the uniform grid becoming the bento): re-measure scroll positions.
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: grid, dependencies: [photos, uniform] },
  );

  return (
    <>
      <div
        ref={grid}
        className="grid grid-flow-dense auto-rows-30 grid-cols-2 gap-3 perspective-distant sm:auto-rows-40 sm:grid-cols-3 sm:gap-4 lg:auto-rows-46 lg:grid-cols-4"
      >
        {photos.map((photo, i) => (
          <div key={photo.src} data-tile className={`relative ${tiles[i]}`}>
            <button
              type="button"
              onClick={(e) => {
                lastOpened.current = e.currentTarget;
                setOpenIndex(i);
              }}
              onPointerMove={tilt}
              onPointerLeave={untilt}
              aria-label={photo.alt ? `Open photo: ${photo.alt}` : "Open photo"}
              className="group relative block size-full overflow-hidden rounded-2xl shadow-md shadow-ink/5 transition-[transform,box-shadow] duration-300 ease-out transform-[rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:z-10 hover:shadow-2xl hover:shadow-primary/20 sm:rounded-3xl"
            >
              <Image
                src={photo.thumbSrc && !tiles[i].includes("col-span-2") ? photo.thumbSrc : photo.src}
                alt={photo.alt}
                fill
                loading={i < eager ? "eager" : "lazy"}
                unoptimized={photo.unoptimized}
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 66vw, 100vw"
                placeholder={photo.blurDataURL ? "blur" : "empty"}
                blurDataURL={photo.blurDataURL}
                style={{ objectPosition: photo.position }}
                className="object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:saturate-125"
              />
              {/* Soft light that follows the cursor */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgb(255_255_255/0.28),transparent_55%)]"
              />
              {/* Caption slides up on hover / keyboard focus */}
              <span className="absolute inset-x-2 bottom-2 flex translate-y-3 items-center justify-between gap-2 rounded-full bg-white/70 px-3 py-1.5 text-left text-xs text-ink opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <span className="truncate">{photo.category ?? "View"}</span>
                <span aria-hidden className="shrink-0">
                  ⤢
                </span>
              </span>
            </button>
            {actions && <div className="absolute top-2 right-2 z-10 flex gap-2">{actions(i)}</div>}
          </div>
        ))}
      </div>

      {openIndex !== null && photos.length > 0 && (
        <PhotoPreview
          photos={photos}
          index={Math.min(openIndex, photos.length - 1)}
          onClose={close}
          onChange={setOpenIndex}
          actions={previewActions}
        />
      )}
    </>
  );
}
