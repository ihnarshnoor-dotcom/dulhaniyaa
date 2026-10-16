"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Photo } from "@/data/site";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/ui/Icons";

type Props = {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function Lightbox({ photos, index, onClose, onChange }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const photo = photos[index];
  const count = photos.length;

  const prev = () => onChange((index - 1 + count) % count);
  const next = () => onChange((index + 1) % count);

  // Keyboard controls + lock page scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChange((index - 1 + count) % count);
      if (e.key === "ArrowRight") onChange((index + 1) % count);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, count, onClose, onChange]);

  useEffect(() => closeButton.current?.focus(), []);

  if (!photo) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) (diff < 0 ? next : prev)();
        touchStartX.current = null;
      }}
    >
      <div className="relative h-[80svh] w-full max-w-5xl px-2" onClick={(e) => e.stopPropagation()}>
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          className="rounded-2xl object-contain"
        />
      </div>

      <p className="absolute inset-x-0 bottom-4 px-16 text-center text-sm text-white/80">
        {photo.alt}
        <span className="ml-2 text-white/50">
          {index + 1} / {count}
        </span>
      </p>

      <button
        ref={closeButton}
        type="button"
        onClick={onClose}
        aria-label="Close photo viewer"
        className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <CloseIcon width={24} height={24} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        aria-label="Previous photo"
        className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
      >
        <ChevronLeftIcon width={26} height={26} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        aria-label="Next photo"
        className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
      >
        <ChevronRightIcon width={26} height={26} />
      </button>
    </div>
  );
}
