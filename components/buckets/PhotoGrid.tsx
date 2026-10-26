"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { categoryLabel } from "@/lib/photoCategories";
import { photoAlt, type ApiPhoto } from "@/lib/photosApi";

const gridClass = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

type Props<T extends ApiPhoto> = {
  photos: T[];
  /** Fade the grid while newer results load. */
  dimmed?: boolean;
  /** A tile was clicked. `tile` gets focus back when the preview closes. */
  onOpen: (index: number, tile: HTMLButtonElement) => void;
  /** A photo failed to load (private links expire after about an hour). */
  onImageError?: () => void;
  /** A button on the tile's top-right corner, e.g. "Remove from collection". */
  overlay?: (photo: T) => ReactNode;
};

/** Square photo tiles that open the full-screen preview. Used by /account/saved and /collections/[bucketId]. */
export function PhotoGrid<T extends ApiPhoto>({ photos, dimmed = false, onOpen, onImageError, overlay }: Props<T>) {
  return (
    <ul className={`${gridClass} transition-opacity ${dimmed ? "opacity-50" : ""}`}>
      {photos.map((photo, i) => (
        <li key={photo.id} className="relative aspect-square">
          <button
            type="button"
            onClick={(e) => onOpen(i, e.currentTarget)}
            aria-label={`Open photo: ${photoAlt(photo)}`}
            className="group relative block size-full overflow-hidden rounded-2xl bg-secondary/40 shadow-md shadow-ink/5 transition-shadow hover:shadow-2xl hover:shadow-primary/20 sm:rounded-3xl"
          >
            <Image
              src={photo.thumb_url ?? photo.url}
              alt={photoAlt(photo)}
              fill
              unoptimized
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              onError={onImageError}
              className="object-cover transition duration-700 ease-out group-hover:scale-110"
            />
            <span className="absolute inset-x-2 bottom-2 truncate rounded-full bg-white/70 px-3 py-1.5 text-left text-xs text-ink backdrop-blur-md">
              {photo.title || categoryLabel(photo.category)}
            </span>
          </button>
          {overlay?.(photo)}
        </li>
      ))}
    </ul>
  );
}

export function PhotoGridSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className={gridClass}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="shimmer aspect-square rounded-2xl" />
      ))}
    </div>
  );
}

/** The round × on a tile's corner. */
export const tileButtonClass =
  "absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur-md transition hover:bg-primary hover:text-white disabled:opacity-50";

/** The pill under the photo in the full-screen preview. */
export const previewActionClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-ink shadow-xl transition hover:bg-primary hover:text-white disabled:opacity-60";
