"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { SaveToBucket } from "@/components/buckets/SaveToBucket";
import { SharePhoto } from "@/components/share/SharePhoto";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";
import { categoryLabel, photoCategories } from "@/lib/photoCategories";
import { friendlyMessage, getPhotogram, isPhotosApiEnabled, photoAlt, type ApiPhoto } from "@/lib/photosApi";
import { buildQuery, filtersFromParams, MAX_QUERY_LENGTH, normalizeQuery, type FeedFilters } from "@/lib/photoSearch";
import { gsap, useGSAP } from "@/lib/gsap";
import { tilt, untilt } from "./PhotoBento";
import { PhotoPreview, toPreviewPhoto } from "./PhotoPreview";

const filterKey = (f: FeedFilters) => `${f.q}|${f.category}`;

/** Keeps the search in the address bar (shareable, survives refresh) without a navigation. */
function syncUrl(filters: FeedFilters) {
  const params = new URLSearchParams(window.location.search);
  params.delete("q");
  params.delete("category");
  const query = buildQuery({ ...Object.fromEntries(params), q: filters.q, category: filters.category });
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${query}${window.location.hash}`);
}

/**
 * Photos shared by the community through the photos API, shown under the curated Photogram,
 * with search and category filters. Renders nothing when the photos API is off.
 */
export function CommunityPhotos() {
  if (!isPhotosApiEnabled) return null;
  return (
    // useSearchParams needs a Suspense boundary so the rest of the page can still be prerendered.
    <Suspense fallback={<FeedSkeleton />}>
      <CommunityFeed />
    </Suspense>
  );
}

type Status = { state: "loading" } | { state: "ready" } | { state: "error"; message: string };

function CommunityFeed() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FeedFilters>(() => filtersFromParams(searchParams));
  const [queryInput, setQueryInput] = useState(filters.q);
  const [photos, setPhotos] = useState<ApiPhoto[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ state: "loading" });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const lastOpened = useRef<HTMLButtonElement | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const currentKey = useRef(filterKey(filters));
  // Scope for the entrance animation. On the always-rendered wrapper, not the grid, which only exists once photos load.
  const results = useRef<HTMLDivElement>(null);

  const stale = loadedKey !== null && loadedKey !== filterKey(filters);
  const filtered = filters.q !== "" || filters.category !== "";

  // Fetch the first page on mount and whenever the filters change. Next.js keeps visited pages
  // alive in the background and re-runs effects when one is shown again, so a photo just
  // uploaded appears on return.
  useEffect(() => {
    const controller = new AbortController();
    const key = filterKey(filters);
    currentKey.current = key;
    getPhotogram(0, filters, controller.signal)
      .then((page) => {
        setPhotos(page.photos);
        setNextPage(page.nextPage);
        setLoadedKey(key);
        setMoreError(null);
        setStatus({ state: "ready" });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setStatus({ state: "error", message: friendlyMessage(err) });
      });
    return () => controller.abort();
  }, [filters, reloadKey]);

  useEffect(() => syncUrl(filters), [filters]);

  function applyFilters(next: FeedFilters) {
    if (filterKey(next) !== filterKey(filters)) setFilters(next);
  }

  // Search after a short pause in typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = normalizeQuery(queryInput);
      setFilters((current) => (current.q === q ? current : { ...current, q }));
    }, 350);
    return () => clearTimeout(timer);
  }, [queryInput]);

  // Same entrance as the curated grid: each new tile rises in as it scrolls into view.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-tile]:not([data-shown])").forEach((tile) => {
          tile.dataset.shown = "";
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
    },
    { scope: results, dependencies: [photos] },
  );

  // Close the preview if Next.js hides this page in the background.
  useLayoutEffect(() => () => setOpenIndex(null), []);

  async function loadMore() {
    if (nextPage === null) return;
    const key = filterKey(filters);
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await getPhotogram(nextPage, filters);
      // The filters changed while this page was loading: drop it.
      if (key !== currentKey.current) return;
      setPhotos((current) => {
        const seen = new Set(current.map((p) => p.id));
        return [...current, ...page.photos.filter((p) => !seen.has(p.id))];
      });
      setNextPage(page.nextPage);
    } catch (err) {
      setMoreError(friendlyMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  function clearFilters() {
    setQueryInput("");
    applyFilters({ q: "", category: "" });
  }

  const close = useCallback(() => {
    setOpenIndex(null);
    requestAnimationFrame(() => lastOpened.current?.focus({ preventScroll: true }));
  }, []);

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${active ? "bg-primary text-white" : "bg-secondary/60 text-primary hover:bg-secondary"}`;

  return (
    <section aria-labelledby="community-heading" className="mt-20 sm:mt-28">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">Community</p>
        <h2 id="community-heading" className="text-4xl leading-tight sm:text-5xl">
          From our community
        </h2>
        <p className="max-w-md leading-relaxed text-muted">Looks, details and moments shared by our brides and their families.</p>
        <Link href="/account/upload" className="text-sm font-medium text-primary underline underline-offset-4">
          Upload your photo
        </Link>
      </div>

      {/* Search and category filters */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative w-full max-w-md">
          <label htmlFor="photogram-search" className="sr-only">
            Search community photos
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            id="photogram-search"
            type="search"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            maxLength={MAX_QUERY_LENGTH}
            placeholder="Search pink, haldi, lehenga…"
            autoComplete="off"
            enterKeyHint="search"
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
        <div role="group" aria-label="Filter by category" className="flex max-w-full flex-wrap justify-center gap-2">
          <button
            type="button"
            aria-pressed={filters.category === ""}
            onClick={() => applyFilters({ ...filters, category: "" })}
            className={chipClass(filters.category === "")}
          >
            All
          </button>
          {photoCategories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filters.category === c}
              onClick={() => applyFilters({ ...filters, category: filters.category === c ? "" : c })}
              className={chipClass(filters.category === c)}
            >
              {categoryLabel(c)}
            </button>
          ))}
        </div>
      </div>

      <div ref={results} aria-busy={status.state === "loading" || stale}>
        {status.state === "loading" && <FeedSkeleton />}

        {status.state === "error" && (
          <div role="alert" className="mx-auto max-w-md rounded-lg bg-red-50 p-4 text-center text-sm text-red-800">
            <p>{status.message}</p>
            <button
              type="button"
              onClick={() => {
                setStatus({ state: "loading" });
                setReloadKey((k) => k + 1);
              }}
              className="mt-2 font-semibold text-primary underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {status.state === "ready" && photos.length === 0 && !stale && (
          <p role="status" className="text-center text-muted">
            {filtered ? (
              <>
                No community photos match your search.{" "}
                <button type="button" onClick={clearFilters} className="font-medium text-primary underline underline-offset-4">
                  Clear filters
                </button>
              </>
            ) : (
              <>
                No community photos yet.{" "}
                <Link href="/account/upload" className="font-medium text-primary underline underline-offset-4">
                  Be the first to share one.
                </Link>
              </>
            )}
          </p>
        )}

        {status.state === "ready" && photos.length > 0 && (
          <>
            <ul
              className={`grid grid-cols-2 gap-3 transition-opacity perspective-distant sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 ${stale ? "opacity-50" : ""}`}
            >
              {photos.map((photo, i) => (
                <li key={photo.id} data-tile className="relative aspect-square">
                  <button
                    type="button"
                    onClick={(e) => {
                      lastOpened.current = e.currentTarget;
                      setOpenIndex(i);
                    }}
                    onPointerMove={tilt}
                    onPointerLeave={untilt}
                    aria-label={`Open photo: ${photoAlt(photo)}`}
                    className="group relative block size-full overflow-hidden rounded-2xl shadow-md shadow-ink/5 transition-[transform,box-shadow] duration-300 ease-out transform-[rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] hover:z-10 hover:shadow-2xl hover:shadow-primary/20 sm:rounded-3xl"
                  >
                    <Image
                      src={photo.thumb_url ?? photo.url}
                      alt={photoAlt(photo)}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition duration-700 ease-out group-hover:scale-110 group-hover:saturate-125"
                    />
                    {/* Soft light that follows the cursor */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgb(255_255_255/0.28),transparent_55%)]"
                    />
                    <span className="absolute inset-x-2 bottom-2 flex translate-y-3 items-center justify-between gap-2 rounded-full bg-white/70 px-3 py-1.5 text-left text-xs text-ink opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <span className="truncate">{categoryLabel(photo.category)}</span>
                      <span aria-hidden className="shrink-0">
                        ⤢
                      </span>
                    </span>
                  </button>
                  <SaveToBucket photo={photo} className="absolute top-2 right-2 z-10" />
                </li>
              ))}
            </ul>

            {(nextPage !== null || moreError) && !stale && (
              <div className="mt-10 text-center">
                {moreError && (
                  <p role="alert" className="mb-3 text-sm text-red-700">
                    {moreError}
                  </p>
                )}
                {nextPage !== null && (
                  <button type="button" onClick={loadMore} disabled={loadingMore} className={buttonClasses("secondary", "disabled:opacity-60")}>
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {openIndex !== null && photos.length > 0 && (
        <PhotoPreview
          photos={photos.map(toPreviewPhoto)}
          index={Math.min(openIndex, photos.length - 1)}
          onClose={close}
          onChange={setOpenIndex}
          actions={(i) =>
            photos[i] && (
              <>
                <SaveToBucket key={`save-${photos[i].id}`} photo={photos[i]} variant="labelled" />
                <SharePhoto key={`share-${photos[i].id}`} photo={photos[i]} variant="labelled" />
              </>
            )
          }
        />
      )}
    </section>
  );
}

function FeedSkeleton() {
  return (
    <div role="status" aria-label="Loading community photos" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="shimmer aspect-square rounded-2xl sm:rounded-3xl" />
      ))}
    </div>
  );
}
