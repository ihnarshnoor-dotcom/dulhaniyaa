"use client";

import { useEffect, useMemo, useState } from "react";
import { SaveToBucket } from "@/components/buckets/SaveToBucket";
import { SharePhoto } from "@/components/share/SharePhoto";
import { buttonClasses } from "@/components/ui/Button";
import { categoryLabel } from "@/lib/photoCategories";
import { friendlyMessage, getPhotogram, imageAlt, type ApiPhoto, type FeedPage } from "@/lib/photosApi";
import { ABOVE_THE_FOLD, PhotoBento, type BentoPhoto } from "./PhotoBento";

type Sized = { photo: ApiPhoto; width: number; height: number };

/** Used when a photo's shape can't be read, and for server-rendered photos until it is: one ordinary 3:2 tile. */
const DEFAULT_SIZE = { width: 3, height: 2 };

/**
 * The API doesn't send photo sizes, but the bento sizes each tile by the photo's shape. The thumbnail has
 * the same shape and is small, and loading it here also warms the cache for the tile itself.
 */
function measure(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const done = (size: { width: number; height: number }) => {
      clearTimeout(timer);
      resolve(size.width > 0 && size.height > 0 ? size : DEFAULT_SIZE);
    };
    const timer = setTimeout(() => done(DEFAULT_SIZE), 8000);
    img.onload = () => done({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => done(DEFAULT_SIZE);
    img.src = src;
  });
}

const withSizes = (photos: ApiPhoto[]): Promise<Sized[]> =>
  Promise.all(photos.map(async (photo) => ({ photo, ...(await measure(photo.thumb_url ?? photo.url)) })));

const toBento = ({ photo, width, height }: Sized): BentoPhoto => ({
  src: photo.url,
  thumbSrc: photo.thumb_url ?? undefined,
  alt: imageAlt(photo),
  width,
  height,
  unoptimized: true,
  category: categoryLabel(photo.category),
});

/**
 * The official Dulhaniyaa photos from the photos API (source=photogram), in the bento grid, with
 * "Add to collection" and "Share" on each photo. The /photogram page supplies the heading and
 * `initial`, the first page fetched on the server, so the photos are in the HTML.
 *
 * Their shapes aren't known on the server, so they first show as a uniform grid of 3:2 tiles; once
 * the thumbnails are read in the browser, the bento sizes each tile by its photo.
 */
export function PhotogramPhotos({ initial }: { initial: FeedPage }) {
  const [photos, setPhotos] = useState<Sized[]>(() => initial.photos.map((photo) => ({ photo, ...DEFAULT_SIZE })));
  const [shaped, setShaped] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(initial.nextPage);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const bentoPhotos = useMemo(() => photos.map(toBento), [photos]);

  useEffect(() => {
    let cancelled = false;
    withSizes(initial.photos).then((sized) => {
      if (cancelled) return;
      const sizes = new Map(sized.map((s) => [s.photo.id, s]));
      // Photos from "Load more" may already be in the list; they were measured when they arrived.
      setPhotos((current) => current.map((s) => sizes.get(s.photo.id) ?? s));
      setShaped(true);
    });
    return () => {
      cancelled = true;
    };
  }, [initial.photos]);

  async function loadMore() {
    if (nextPage === null) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await getPhotogram(nextPage, {}, { source: "photogram" });
      const sized = await withSizes(page.photos);
      setPhotos((current) => {
        const seen = new Set(current.map((s) => s.photo.id));
        return [...current, ...sized.filter((s) => !seen.has(s.photo.id))];
      });
      setNextPage(page.nextPage);
    } catch (err) {
      setMoreError(friendlyMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <PhotoBento
        photos={bentoPhotos}
        uniform={!shaped}
        eager={ABOVE_THE_FOLD}
        actions={(i) =>
          photos[i] && (
            <>
              <SharePhoto photo={photos[i].photo} variant="overlay" />
              <SaveToBucket photo={photos[i].photo} />
            </>
          )
        }
        previewActions={(i) =>
          photos[i] && (
            <>
              <SaveToBucket key={`save-${photos[i].photo.id}`} photo={photos[i].photo} variant="labelled" />
              <SharePhoto key={`share-${photos[i].photo.id}`} photo={photos[i].photo} variant="labelled" />
            </>
          )
        }
      />

      {(nextPage !== null || moreError) && (
        <div className="mt-10 text-center">
          {moreError && (
            <p role="alert" className="mb-3 text-sm text-red-700">
              {moreError}
            </p>
          )}
          {nextPage !== null && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className={buttonClasses("secondary", "disabled:opacity-60")}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
