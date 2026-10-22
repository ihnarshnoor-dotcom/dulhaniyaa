"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { categoryLabel } from "@/lib/photoCategories";
import { friendlyMessage, getSharedPhoto, photoAlt, PhotosApiError, type ApiPhoto } from "@/lib/photosApi";

type Status =
  | { state: "loading" }
  | { state: "ready"; photo: ApiPhoto }
  | { state: "gone" }
  | { state: "error"; message: string };

/** The photo behind a share link, for anyone who opens it. */
export function SharedPhoto({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>({ state: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  // Fetched once: every request counts as a view and the backend rate-limits this endpoint.
  useEffect(() => {
    const controller = new AbortController();
    getSharedPhoto(token, controller.signal)
      .then((photo) => setStatus({ state: "ready", photo }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof PhotosApiError && err.status === 404) setStatus({ state: "gone" });
        else setStatus({ state: "error", message: friendlyMessage(err) });
      });
    return () => controller.abort();
  }, [token, reloadKey]);

  if (status.state === "loading") return <SharedPhotoSkeleton />;

  if (status.state === "gone") {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
        <p className="font-serif text-3xl">This link has expired</p>
        <p className="mt-3 leading-relaxed text-muted">
          Share links work for a few days, and the person who shared it may have turned it off. Ask them for a new one.
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
    );
  }

  const { photo } = status;
  return (
    <figure className="flex flex-col items-center text-center">
      <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">Shared from Photogram</p>
      <Image
        src={photo.url}
        alt={photoAlt(photo)}
        width={1200}
        height={1500}
        unoptimized
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

export function SharedPhotoSkeleton() {
  return (
    <div role="status" aria-label="Loading the shared photo" className="flex flex-col items-center">
      <div className="shimmer h-3 w-40 rounded-full" />
      <div className="shimmer mt-6 aspect-4/5 w-full max-w-md rounded-3xl" />
      <div className="shimmer mt-6 h-10 w-64 rounded-2xl" />
    </div>
  );
}
