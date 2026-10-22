"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Photo } from "@/data/site";
import { PhotoPreview } from "@/components/photogram/PhotoPreview";
import { Button, buttonClasses } from "@/components/ui/Button";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";
import { categoryLabel } from "@/lib/photoCategories";
import {
  friendlyMessage,
  getBucketImages,
  getBuckets,
  getSaved,
  photoAlt,
  removeFromBucket,
  searchSaved,
  type Bucket,
  type SavedPage,
  type SavedPhoto,
} from "@/lib/photosApi";
import { MAX_QUERY_LENGTH, normalizeQuery } from "@/lib/photoSearch";
import { NewBucketForm } from "./NewBucketForm";

const ALL = "all";

/** Picks the right endpoint for the current tab and search. */
function loadSaved(view: string, query: string, cursor: string | null, signal?: AbortSignal): Promise<SavedPage> {
  const bucketId = view === ALL ? null : view;
  if (query) return searchSaved({ q: query, bucketId, cursor }, signal);
  return bucketId ? getBucketImages(bucketId, cursor, signal) : getSaved(cursor, signal);
}

const toPreviewPhoto = (p: SavedPhoto): Photo => ({ src: p.url, alt: photoAlt(p), width: 1200, height: 1500, unoptimized: true });

/** /account/saved: buckets as tabs, a search box, and the saved photos. */
export function SavedView() {
  const [buckets, setBuckets] = useState<Bucket[] | null>(null);
  const [bucketsError, setBucketsError] = useState<string | null>(null);
  const [view, setView] = useState(ALL);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  // Results, tagged with the tab + search they belong to so stale ones can be dimmed.
  const [result, setResult] = useState<{ key: string; photos: SavedPhoto[]; nextCursor: string | null } | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const retriedImages = useRef(false);
  const lastOpened = useRef<HTMLButtonElement | null>(null);

  const currentKey = `${view}|${query}`;
  const stale = result !== null && result.key !== currentKey;

  useEffect(() => {
    const controller = new AbortController();
    getBuckets(controller.signal)
      .then((list) => {
        setBuckets(list);
        setBucketsError(null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setBucketsError(friendlyMessage(err));
      });
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    const key = `${view}|${query}`;
    retriedImages.current = false;
    loadSaved(view, query, null, controller.signal)
      .then((page) => {
        setResult({ key, photos: page.photos, nextCursor: page.nextCursor });
        setListError(null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setListError(friendlyMessage(err));
      });
    return () => controller.abort();
  }, [view, query, reloadKey]);

  // Search after a short pause in typing.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(normalizeQuery(queryInput)), 300);
    return () => clearTimeout(timer);
  }, [queryInput]);

  useLayoutEffect(() => () => setOpenIndex(null), []);

  async function loadMore() {
    if (!result?.nextCursor) return;
    setLoadingMore(true);
    setActionError(null);
    try {
      const page = await loadSaved(view, query, result.nextCursor);
      setResult((current) => {
        if (!current || current.key !== currentKey) return current;
        const seen = new Set(current.photos.map((p) => p.id));
        return { ...current, photos: [...current.photos, ...page.photos.filter((p) => !seen.has(p.id))], nextCursor: page.nextCursor };
      });
    } catch (err) {
      setActionError(friendlyMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  async function remove(photo: SavedPhoto) {
    if (view === ALL) return;
    setRemovingId(photo.id);
    setActionError(null);
    try {
      await removeFromBucket(view, photo.id);
      setResult((current) => current && { ...current, photos: current.photos.filter((p) => p.id !== photo.id) });
      // Removing the last photo from the open viewer closes it; otherwise it moves on to the next one.
      if (photos.length <= 1) setOpenIndex(null);
    } catch (err) {
      setActionError(friendlyMessage(err));
    } finally {
      setRemovingId(null);
    }
  }

  // Private links expire after about an hour: refetch once to get fresh ones.
  function onImageError() {
    if (retriedImages.current) return;
    retriedImages.current = true;
    setReloadKey((k) => k + 1);
  }

  const close = useCallback(() => {
    setOpenIndex(null);
    requestAnimationFrame(() => lastOpened.current?.focus({ preventScroll: true }));
  }, []);

  const currentBucket = buckets?.find((b) => b.id === view);
  const photos = result?.photos ?? [];
  const tabClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${active ? "bg-primary text-white" : "bg-secondary/60 text-primary hover:bg-secondary"}`;

  return (
    <>
      {/* Buckets */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Collections">
        <button type="button" aria-pressed={view === ALL} onClick={() => setView(ALL)} className={tabClass(view === ALL)}>
          All saved
        </button>
        {buckets?.map((bucket) => (
          <button
            key={bucket.id}
            type="button"
            aria-pressed={view === bucket.id}
            onClick={() => setView(bucket.id)}
            className={tabClass(view === bucket.id)}
          >
            {bucket.name}
          </button>
        ))}
        {buckets === null && !bucketsError && <span aria-hidden className="shimmer h-9 w-28 rounded-full" />}
        <button
          type="button"
          aria-expanded={creating}
          onClick={() => setCreating((c) => !c)}
          className="shrink-0 rounded-full border border-dashed border-primary/50 px-4 py-2 text-sm text-primary transition-colors hover:border-primary"
        >
          + New collection
        </button>
      </div>
      {bucketsError && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {bucketsError}
        </p>
      )}

      {creating && (
        <div className="mt-5 max-w-md">
          <NewBucketForm
            label="Collection name"
            autoFocus
            onCreated={(bucket) => {
              setBuckets((list) => [...(list ?? []), bucket]);
              setCreating(false);
              setView(bucket.id);
            }}
          />
        </div>
      )}

      {/* Search */}
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-6 max-w-md">
        <label htmlFor="saved-search" className="sr-only">
          Search {currentBucket ? `in ${currentBucket.name}` : "your saved photos"}
        </label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
        <input
          id="saved-search"
          type="search"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          maxLength={MAX_QUERY_LENGTH}
          placeholder={currentBucket ? `Search in ${currentBucket.name}…` : "Search saved photos…"}
          autoComplete="off"
          className="block min-h-12 w-full rounded-full border border-ink/15 bg-white/60 py-3 pr-12 pl-11 text-base text-ink placeholder:text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {queryInput && (
          <button
            type="button"
            onClick={() => setQueryInput("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-secondary/60"
          >
            <CloseIcon width={16} height={16} />
          </button>
        )}
      </form>

      {/* Photos */}
      <div className="mt-8" aria-busy={result === null || stale}>
        {listError && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
            <p>{listError}</p>
            <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="mt-2 font-semibold text-primary underline underline-offset-4">
              Try again
            </button>
          </div>
        )}

        {!listError && result === null && (
          <div role="status" aria-label="Loading saved photos" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="shimmer aspect-square rounded-2xl" />
            ))}
          </div>
        )}

        {!listError && result !== null && photos.length === 0 && !stale && (
          <EmptyState query={query} bucket={currentBucket} hasBuckets={(buckets?.length ?? 0) > 0} onClear={() => setQueryInput("")} />
        )}

        {actionError && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {actionError}
          </p>
        )}

        {photos.length > 0 && (
          <ul className={`grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 ${stale ? "opacity-50" : ""}`}>
            {photos.map((photo, i) => (
              <li key={photo.id} className="relative aspect-square">
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
                {view !== ALL && (
                  <button
                    type="button"
                    onClick={() => remove(photo)}
                    disabled={removingId !== null}
                    aria-label={`Remove "${photoAlt(photo)}" from ${currentBucket?.name ?? "this collection"}`}
                    title="Remove from collection"
                    className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur-md transition hover:bg-primary hover:text-white disabled:opacity-50"
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {result?.nextCursor && !stale && (
          <div className="mt-8 text-center">
            <button type="button" onClick={loadMore} disabled={loadingMore} className={buttonClasses("secondary", "disabled:opacity-60")}>
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>

      {openIndex !== null && photos.length > 0 && (
        <PhotoPreview
          photos={photos.map(toPreviewPhoto)}
          index={Math.min(openIndex, photos.length - 1)}
          onClose={close}
          onChange={setOpenIndex}
          // Saved photos are already in a collection, so there's no "Add to collection" here.
          // Inside a collection the viewer offers "Remove from …" instead; "All saved" shows no button.
          actions={
            currentBucket
              ? (i) =>
                  photos[i] && (
                    <div className="flex flex-col items-center gap-2 sm:items-start">
                      <button
                        type="button"
                        onClick={() => remove(photos[i])}
                        disabled={removingId !== null}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-ink shadow-xl transition hover:bg-primary hover:text-white disabled:opacity-60"
                      >
                        <CloseIcon width={18} height={18} />
                        {removingId === photos[i].id ? "Removing…" : `Remove from ${currentBucket.name}`}
                      </button>
                      {actionError && (
                        <p role="alert" className="max-w-56 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
                          {actionError}
                        </p>
                      )}
                    </div>
                  )
              : undefined
          }
        />
      )}
    </>
  );
}

function EmptyState({ query, bucket, hasBuckets, onClear }: { query: string; bucket?: Bucket; hasBuckets: boolean; onClear: () => void }) {
  if (query) {
    return (
      <p className="text-muted">
        No saved photos match &ldquo;{query}&rdquo;{bucket ? ` in ${bucket.name}` : ""}.{" "}
        <button type="button" onClick={onClear} className="font-medium text-primary underline underline-offset-4">
          Clear search
        </button>
      </p>
    );
  }
  return (
    <div className="rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
      <p className="font-serif text-3xl">{bucket ? "This collection is empty" : "Nothing saved yet"}</p>
      <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
        {hasBuckets
          ? "Browse Photogram and tap the bookmark on any photo to add it to a collection."
          : "Browse Photogram and tap the bookmark on any photo to start your first collection."}
      </p>
      <Button href="/photogram" className="mt-6">
        Browse Photogram
      </Button>
    </div>
  );
}
