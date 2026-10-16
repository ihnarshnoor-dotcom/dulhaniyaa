"use client";

import Image from "next/image";
import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import type { Photo } from "@/data/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { PhotoPreview } from "./PhotoPreview";

type BentoPhoto = Photo & { category?: string };

/**
 * Tile size follows the photo's shape so as little as possible is cropped.
 * One grid cell is roughly 3:2.
 */
function tileClass(photo: Photo, i: number) {
  const ratio = photo.width / photo.height;
  if (ratio < 0.85) return "row-span-2"; // portrait
  if (ratio >= 2.4) return "col-span-2"; // panorama / side-by-side collage
  if (ratio >= 1.35 && ratio < 1.95 && i % 5 === 0) return "col-span-2 row-span-2"; // feature
  return "";
}

// Tilt and light only for mouse users who haven't asked for less motion.
const canTilt = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches;

function tilt(e: PointerEvent<HTMLButtonElement>) {
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

function untilt(e: PointerEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
}

export function PhotoBento({ photos }: { photos: BentoPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const lastOpened = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    // Put keyboard focus back on the photo that was opened.
    requestAnimationFrame(() => lastOpened.current?.focus({ preventScroll: true }));
  }, []);

  // Close the preview if Next.js hides this page in the background.
  useLayoutEffect(() => () => setOpenIndex(null), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-tile]").forEach((tile) => {
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
      return () => mm.revert();
    },
    { scope: grid },
  );

  return (
    <>
      <div
        ref={grid}
        className="grid grid-flow-dense auto-rows-[7.5rem] grid-cols-2 gap-3 [perspective:1200px] sm:auto-rows-[10rem] sm:grid-cols-3 sm:gap-4 lg:auto-rows-[11.5rem] lg:grid-cols-4"
      >
        {photos.map((photo, i) => (
          <div key={photo.src} data-tile className={tileClass(photo, i)}>
            <button
              type="button"
              onClick={(e) => {
                lastOpened.current = e.currentTarget;
                setOpenIndex(i);
              }}
              onPointerMove={tilt}
              onPointerLeave={untilt}
              aria-label={`Open photo: ${photo.alt}`}
              className="group relative block size-full overflow-hidden rounded-2xl shadow-md shadow-ink/5 transition-[transform,box-shadow] duration-300 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:z-10 hover:shadow-2xl hover:shadow-primary/20 sm:rounded-3xl"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
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
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <PhotoPreview photos={photos} index={openIndex} onClose={close} onChange={setOpenIndex} />
      )}
    </>
  );
}
