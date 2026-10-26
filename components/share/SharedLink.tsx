"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { categoryLabel } from "@/lib/photoCategories";
import { friendlyMessage, getShare, photoAlt, PhotosApiError, type ApiPhoto } from "@/lib/photosApi";
import type { SharedLink as Link } from "@/lib/share";

type Status = { state: "loading" } | { state: "ready"; link: Link } | { state: "gone" } | { state: "error"; message: string };

/**
 * What a share link shows, for anyone who opens it: one photo. Old collection links get the same
 * "expired" message as any other dead link (the backend answers 404 for them).
 */
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

  return <SinglePhoto photo={status.link.photo} />;
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

export function SharedLinkSkeleton() {
  return (
    <div role="status" aria-label="Loading what was shared" className="flex flex-col items-center">
      <div className="shimmer h-3 w-40 rounded-full" />
      <div className="shimmer mt-6 aspect-4/5 w-full max-w-md rounded-3xl" />
      <div className="shimmer mt-6 h-10 w-64 rounded-2xl" />
    </div>
  );
}
