"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/data/site";
import { PhotoPreview } from "@/components/photogram/PhotoPreview";
import { Button } from "@/components/ui/Button";
import { categoryLabel } from "@/lib/photoCategories";
import { friendlyMessage, getShare, photoAlt, PhotosApiError, type ApiPhoto } from "@/lib/photosApi";
import { photoCountLabel, type SharedLink as Link } from "@/lib/share";

type Status = { state: "loading" } | { state: "ready"; link: Link } | { state: "gone" } | { state: "error"; message: string };

/** What a share link shows, for anyone who opens it: one photo or a whole collection. */
export function SharedLink({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>({ state: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  // Fetched once per load: every request counts as a view and the backend rate-limits this endpoint.
  useEffect(() => {
    const controller = new AbortController();
    getShare(token, controller.signal)
      .then((link) => setStatus({ state: "ready", link }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof PhotosApiError && err.status === 404) setStatus({ state: "gone" });
        else setStatus({ state: "error", message: friendlyMessage(err) });
      });
    return () => controller.abort();
  }, [token, reloadKey]);

  const reload = useCallback(() => {
    setStatus({ state: "loading" });
    setReloadKey((k) => k + 1);
  }, []);

  if (status.state === "loading") return <SharedLinkSkeleton />;

  if (status.state === "gone") {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
        <p className="font-serif text-3xl">This link has expired</p>
        <p className="mt-3 leading-relaxed text-muted">
          The person who shared it may have turned it off, or it ran out of time. Ask them for a new one.
        </p>
        <Button href="/photogram" className="mt-6">
          Browse Photogram
        </Button>
      </div>
    );
  }

  if (status.state === "error") {
    return (
      <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 p-4 text-center text-sm text-red-800">
        <p>{status.message}</p>
        <button type="button" onClick={reload} className="mt-2 font-semibold text-primary underline underline-offset-4">
          Try again
        </button>
      </div>
    );
  }

  const { link } = status;
  return link.type === "image" ? <SinglePhoto photo={link.photo} /> : <Collection name={link.name} photos={link.photos} onReload={reload} />;
}

function SinglePhoto({ photo }: { photo: ApiPhoto }) {
  return (
    <figure className="flex flex-col items-center text-center">
      <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">Shared from Photogram</p>
      <Image
        src={photo.url}
        alt={photoAlt(photo)}
        width={1200}
        height={1500}
        unoptimized
        loading="eager"
        fetchPriority="high"
        className="photo-in mt-6 block h-auto max-h-[75svh] w-auto max-w-full rounded-3xl shadow-2xl"
      />
      <figcaption className="mt-6 max-w-xl">
        {photo.title && <h1 className="text-4xl leading-tight sm:text-5xl">{photo.title}</h1>}
        {photo.caption && <p className="mt-3 leading-relaxed text-muted">{photo.caption}</p>}
        <p className="mt-3 text-sm text-muted">{categoryLabel(photo.category)}</p>
      </figcaption>
      <Button href="/photogram" className="mt-10">
        See more on Photogram
      </Button>
    </figure>
  );
}

const toPreviewPhoto = (p: ApiPhoto): Photo => ({ src: p.url, alt: photoAlt(p), width: 1200, height: 1500, unoptimized: true });

/**
 * A shared collection: its name, how many photos, and a grid that opens the full-screen preview.
 * Photo links in a shared collection are signed and expire after about 10 minutes, so a photo that
 * fails to load gets a message and a button to fetch fresh links (not an automatic retry: each fetch counts as a view).
 */
function Collection({ name, photos, onReload }: { name: string; photos: ApiPhoto[]; onReload: () => void }) {
  const [broken, setBroken] = useState<Set<string>>(() => new Set());
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const lastOpened = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    requestAnimationFrame(() => lastOpened.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <div>
      <div className="mb-10 text-center">
        <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">Shared collection</p>
        <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">{name}</h1>
        <p className="mt-4 text-muted">{photoCountLabel(photos.length)}</p>
      </div>

      {photos.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
          <p className="font-serif text-3xl">This collection is empty</p>
          <Button href="/photogram" className="mt-6">
            Browse Photogram
          </Button>
        </div>
      ) : (
        <>
          {broken.size > 0 && (
            <div role="status" className="mx-auto mb-6 max-w-xl rounded-lg bg-secondary/40 p-4 text-center text-sm text-ink">
              Some photos couldn&apos;t load. Their links only last a few minutes, so reload to get fresh ones.{" "}
              <button type="button" onClick={onReload} className="font-semibold text-primary underline underline-offset-4">
                Reload photos
              </button>
            </div>
          )}

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {photos.map((photo, i) => {
              const src = photo.thumb_url ?? photo.url;
              return (
                <li key={photo.id} className="relative aspect-square">
                  {broken.has(src) ? (
                    <div className="grid size-full place-items-center rounded-2xl bg-secondary/40 px-3 text-center text-xs text-muted sm:rounded-3xl">
                      This photo couldn&apos;t load
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        lastOpened.current = e.currentTarget;
                        setOpenIndex(i);
                      }}
                      aria-label={`Open photo: ${photoAlt(photo)}`}
                      className="group relative block size-full overflow-hidden rounded-2xl bg-secondary/40 shadow-md shadow-ink/5 transition-shadow hover:shadow-2xl hover:shadow-primary/20 sm:rounded-3xl"
                    >
                      <Image
                        src={src}
                        alt={photoAlt(photo)}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        // The first row is on screen straight away, so don't lazy-load it.
                        loading={i < 4 ? "eager" : "lazy"}
                        onError={() => setBroken((current) => new Set(current).add(src))}
                        className="object-cover transition duration-700 ease-out group-hover:scale-110"
                      />
                      <span className="absolute inset-x-2 bottom-2 truncate rounded-full bg-white/70 px-3 py-1.5 text-left text-xs text-ink backdrop-blur-md">
                        {photo.title || categoryLabel(photo.category)}
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-12 text-center">
            <Button href="/photogram">See more on Photogram</Button>
          </div>
        </>
      )}

      {openIndex !== null && (
        <PhotoPreview photos={photos.map(toPreviewPhoto)} index={Math.min(openIndex, photos.length - 1)} onClose={close} onChange={setOpenIndex} />
      )}
    </div>
  );
}

export function SharedLinkSkeleton() {
  return (
    <div role="status" aria-label="Loading what was shared" className="flex flex-col items-center">
      <div className="shimmer h-3 w-40 rounded-full" />
      <div className="shimmer mt-6 aspect-4/5 w-full max-w-md rounded-3xl" />
      <div className="shimmer mt-6 h-10 w-64 rounded-2xl" />
    </div>
  );
}
