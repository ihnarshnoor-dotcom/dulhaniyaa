"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import type { Photo } from "@/data/site";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/ui/Icons";

type Props = {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
  /** Optional buttons shown beside the photo (below it on phones), e.g. "Add to collection". */
  actions?: (index: number) => ReactNode;
};

/** True for events from inside a dialog opened on top of the preview, which handles its own keys and touches. */
const fromOpenDialog = (target: EventTarget | null) => target instanceof Element && target.closest("dialog[open]") !== null;

/** Full-screen preview of one photo, with the close button on the photo's top-right corner. */
export function PhotoPreview({ photos, index, onClose, onChange, actions }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const photo = photos[index];
  const count = photos.length;

  const prev = () => onChange((index - 1 + count) % count);
  const next = () => onChange((index + 1) % count);

  // Lock page scroll while open and give it back exactly as it was on close.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Keyboard: Escape closes, arrows switch photos, Tab stays inside the preview.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (fromOpenDialog(e.target)) return;
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onChange((index - 1 + count) % count);
      else if (e.key === "ArrowRight") onChange((index + 1) % count);
      else if (e.key === "Tab" && dialog.current) {
        const buttons = [...dialog.current.querySelectorAll<HTMLButtonElement>("button")];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onClose, onChange]);

  if (!photo) return null;

  const image = (
    <div className="relative">
      <Image
        key={photo.src}
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes="92vw"
        placeholder={photo.blurDataURL ? "blur" : "empty"}
        blurDataURL={photo.blurDataURL}
        unoptimized={photo.unoptimized}
        className={`photo-in block h-auto max-h-[78svh] w-auto max-w-[92vw] rounded-3xl shadow-2xl ${actions ? "max-sm:max-h-[66svh] sm:max-w-[calc(80vw-14rem)]" : "sm:max-w-[80vw]"}`}
      />
      <button
        ref={closeButton}
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute -top-3 -right-3 grid size-11 place-items-center rounded-full bg-white text-ink shadow-xl ring-4 ring-ink/10 transition hover:scale-110 hover:bg-primary hover:text-white"
      >
        <CloseIcon width={20} height={20} />
      </button>
    </div>
  );

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
      className="preview-in fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-xl sm:p-10"
      onClick={onClose}
      onTouchStart={(e) => (touchStartX.current = fromOpenDialog(e.target) ? null : e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) (diff < 0 ? next : prev)();
        touchStartX.current = null;
      }}
    >
      <figure className="flex max-h-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {/* The wrapper shrinks to the photo, so the close button sits on its corner. */}
        {actions ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {image}
            <div className="flex flex-wrap justify-center gap-2 sm:flex-col">{actions(index)}</div>
          </div>
        ) : (
          image
        )}
        <figcaption className="mt-4 max-w-xl px-2 text-center text-sm text-white/85">
          {photo.alt}
          <span className="ml-2 text-white/50 tabular-nums">
            {index + 1} / {count}
          </span>
        </figcaption>
      </figure>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        aria-label="Previous photo"
        className="absolute top-1/2 left-2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 sm:left-6 sm:grid"
      >
        <ChevronLeftIcon width={24} height={24} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        aria-label="Next photo"
        className="absolute top-1/2 right-2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30 sm:right-6 sm:grid"
      >
        <ChevronRightIcon width={24} height={24} />
      </button>
    </div>
  );
}
