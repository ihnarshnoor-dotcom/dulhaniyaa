"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkIcon } from "@/components/ui/Icons";
import { collectionPath, type SharedCollection } from "@/lib/collections";
import { friendlyMessage, sharedWithMe } from "@/lib/photosApi";
import { photoCountLabel } from "@/lib/share";

/** /account/shared: collections other people shared with the signed-in user, each linking to its page. */
export function SharedWithMe() {
  const [collections, setCollections] = useState<SharedCollection[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    sharedWithMe(controller.signal)
      .then((list) => {
        setCollections(list);
        setError(null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(friendlyMessage(err));
      });
    return () => controller.abort();
  }, [reloadKey]);

  return (
    <div aria-busy={collections === null && !error}>
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-800"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setReloadKey((k) => k + 1);
            }}
            className="mt-2 font-semibold text-primary underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      {!error && collections === null && (
        <div
          role="status"
          aria-label="Loading collections shared with you"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="shimmer h-20 rounded-2xl" />
          <div className="shimmer h-20 rounded-2xl" />
        </div>
      )}

      {collections && collections.length === 0 && (
        <div className="rounded-3xl border border-dashed border-ink/20 px-6 py-10 text-center">
          <p className="font-serif text-2xl">
            Nothing has been shared with you yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            When someone shares a collection with your email, it shows up here.
          </p>
        </div>
      )}

      {collections && collections.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <li key={c.id}>
              <Link
                href={collectionPath(c.id)}
                className="flex min-h-20 items-center gap-4 rounded-2xl border border-ink/15 bg-white/60 p-4 transition-colors hover:border-primary"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary/40 text-primary">
                  <BookmarkIcon width={20} height={20} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">
                    {c.name}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    by {c.ownerName} · {photoCountLabel(c.visibleCount)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
