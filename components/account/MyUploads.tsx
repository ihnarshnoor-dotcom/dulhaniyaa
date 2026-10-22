"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SaveToBucket } from "@/components/buckets/SaveToBucket";
import { Button, buttonClasses } from "@/components/ui/Button";
import { TrashIcon } from "@/components/ui/Icons";
import { categoryLabel } from "@/lib/photoCategories";
import { deleteImage, friendlyMessage, getMyUploads, photoAlt, setVisibility, type OwnPhoto } from "@/lib/photosApi";

type Status = { state: "loading" } | { state: "ready" } | { state: "error"; message: string };

/** Loads pages until at least `minCount` photos (or the end), so a refresh keeps what was already shown. */
async function fetchUploads(minCount: number, signal?: AbortSignal) {
  let photos: OwnPhoto[] = [];
  let cursor: string | null = null;
  do {
    const page = await getMyUploads(cursor, signal);
    photos = photos.concat(page.photos);
    cursor = page.nextCursor;
  } while (cursor && photos.length < minCount);
  return { photos, nextCursor: cursor };
}

/** The signed-in user's photos, with a visibility switch and a delete button on each. */
export function MyUploads() {
  const [photos, setPhotos] = useState<OwnPhoto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ state: "loading" });
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Image links that failed to load even after a refresh.
  const [brokenSrcs, setBrokenSrcs] = useState<Set<string>>(() => new Set());
  const retriedImages = useRef(false);
  // The photo waiting for delete confirmation.
  const [toDelete, setToDelete] = useState<OwnPhoto | null>(null);

  const reload = useCallback(async (minCount: number, signal?: AbortSignal) => {
    const result = await fetchUploads(minCount, signal);
    setPhotos(result.photos);
    setNextCursor(result.nextCursor);
    setStatus({ state: "ready" });
  }, []);

  // Fetch on mount, and again whenever Next.js shows this page after keeping it in the background.
  useEffect(() => {
    const controller = new AbortController();
    retriedImages.current = false;
    fetchUploads(1, controller.signal)
      .then((result) => {
        setPhotos(result.photos);
        setNextCursor(result.nextCursor);
        setStatus({ state: "ready" });
      })
      .catch((err) => {
        if (!controller.signal.aborted) setStatus({ state: "error", message: friendlyMessage(err) });
      });
    return () => controller.abort();
  }, []);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    setActionError(null);
    try {
      const page = await getMyUploads(nextCursor);
      setPhotos((current) => {
        const seen = new Set(current.map((p) => p.id));
        return [...current, ...page.photos.filter((p) => !seen.has(p.id))];
      });
      setNextCursor(page.nextCursor);
    } catch (err) {
      setActionError(friendlyMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  async function toggleVisibility(photo: OwnPhoto) {
    const next = photo.visibility === "public" ? "private" : "public";
    if (
      next === "private" &&
      !window.confirm("Make this photo private? It will be removed from Photogram and only you will be able to see it.")
    ) {
      return;
    }
    setBusyId(photo.id);
    setActionError(null);
    try {
      await setVisibility(photo.id, next);
      await reload(photos.length);
    } catch (err) {
      setActionError(friendlyMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  // Private links are signed and expire after about an hour. On the first broken image,
  // refetch the list once to get fresh links; anything still broken shows a placeholder.
  function onImageError(src: string) {
    setBrokenSrcs((current) => new Set(current).add(src));
    if (retriedImages.current) return;
    retriedImages.current = true;
    reload(photos.length).catch(() => {});
  }

  if (status.state === "loading") {
    return (
      <div role="status" aria-label="Loading your uploads" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="shimmer aspect-square rounded-2xl" />
        ))}
      </div>
    );
  }

  if (status.state === "error") {
    return (
      <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
        <p>{status.message}</p>
        <button
          type="button"
          onClick={() => {
            setStatus({ state: "loading" });
            reload(1).catch((err) => setStatus({ state: "error", message: friendlyMessage(err) }));
          }}
          className="mt-2 font-semibold text-primary underline underline-offset-4"
        >
          Try again
        </button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
        <p className="font-serif text-3xl">No uploads yet</p>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
          Share your lehenga, jewellery, decor or any wedding moment. Public photos appear on Photogram.
        </p>
        <Button href="/account/upload" className="mt-6">
          Upload a photo
        </Button>
      </div>
    );
  }

  return (
    <>
      {actionError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {actionError}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {photos.map((photo) => {
          const src = photo.thumb_url ?? photo.url;
          const isPublic = photo.visibility === "public";
          const busy = busyId === photo.id;
          return (
            <li key={photo.id} className="overflow-hidden rounded-2xl bg-white/60 shadow-md shadow-ink/5 sm:rounded-3xl">
              <div className="relative aspect-square bg-secondary/40">
                {brokenSrcs.has(src) ? (
                  <div className="grid size-full place-items-center px-3 text-center text-xs text-muted">Image unavailable</div>
                ) : (
                  <Image
                    src={src}
                    alt={photoAlt(photo)}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    onError={() => onImageError(src)}
                    className="object-cover"
                  />
                )}
                <span
                  className={`absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${
                    isPublic ? "bg-white/80 text-primary" : "bg-ink/75 text-white"
                  }`}
                >
                  {isPublic ? "Public" : "Private"}
                </span>
                <SaveToBucket photo={photo} className="absolute top-2 right-2" />
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-ink" title={photoAlt(photo)}>
                    {photo.title || categoryLabel(photo.category)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setToDelete(photo)}
                    disabled={busyId !== null}
                    aria-label={`Delete "${photoAlt(photo)}"`}
                    title="Delete photo"
                    className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted">
                  <span>{busy ? "Saving…" : "Show on Photogram"}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPublic}
                    aria-label={`Show "${photoAlt(photo)}" on Photogram`}
                    disabled={busyId !== null}
                    onClick={() => toggleVisibility(photo)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                      isPublic ? "bg-primary" : "bg-ink/20"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`size-5 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-5.5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {nextCursor && (
        <div className="mt-8 text-center">
          <button type="button" onClick={loadMore} disabled={loadingMore} className={buttonClasses("secondary", "disabled:opacity-60")}>
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {toDelete && (
        <ConfirmDelete
          photo={toDelete}
          onCancel={() => setToDelete(null)}
          onDeleted={(id) => {
            setPhotos((current) => current.filter((p) => p.id !== id));
            setToDelete(null);
          }}
        />
      )}
    </>
  );
}

/** "Delete this photo?" dialog. Stays open and shows the error if deleting fails. */
function ConfirmDelete({ photo, onCancel, onDeleted }: { photo: OwnPhoto; onCancel: () => void; onDeleted: (id: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Open as a modal: focus is kept inside, and Escape closes it (handled in onCancel below).
  // (Guarded: in development React runs this twice, and opening an open dialog throws.)
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
  }, []);

  async function confirm() {
    setDeleting(true);
    setError(null);
    try {
      await deleteImage(photo.id);
      onDeleted(photo.id);
    } catch (err) {
      setError(friendlyMessage(err));
      setDeleting(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-title"
      aria-describedby="delete-text"
      onCancel={(e) => {
        e.preventDefault();
        if (!deleting) onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl bg-ivory p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
            <Image src={photo.thumb_url ?? photo.url} alt="" fill unoptimized sizes="56px" className="object-cover" />
          </div>
          <h2 id="delete-title" className="text-3xl leading-tight">
            Delete this photo?
          </h2>
        </div>
        <p id="delete-text" className="mt-4 text-sm leading-relaxed text-muted">
          It will also be removed from saved boards and its share links will stop working. This can&apos;t be undone.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={deleting} autoFocus className={buttonClasses("secondary", "min-h-11 px-5 py-2 disabled:opacity-60")}>
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={deleting}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-700 px-5 py-2 text-sm font-medium tracking-wide text-white transition-colors hover:bg-red-800 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
