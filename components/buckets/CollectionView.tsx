"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PhotoPreview, toPreviewPhoto } from "@/components/photogram/PhotoPreview";
import { ShareCollection } from "@/components/share/ShareCollection";
import { Button, buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { collectionLoginHref, hiddenPhotosNote, privateCount } from "@/lib/collections";
import {
  friendlyMessage,
  getBucketImages,
  logout,
  photoAlt,
  PhotosApiError,
  removeFromBucket,
  type CollectionPage,
  type SavedPhoto,
} from "@/lib/photosApi";
import { PhotoGrid, PhotoGridSkeleton, previewActionClass, tileButtonClass } from "./PhotoGrid";

type Status = { state: "loading" } | { state: "ready"; page: CollectionPage } | { state: "unavailable" } | { state: "error"; message: string };

/**
 * /collections/[bucketId]: one collection, for its owner (who can remove photos and share it) and for
 * the people it was shared with (read only, public photos only). Signed-in visitors only.
 */
export function CollectionView({ bucketId }: { bucketId: string }) {
  const [status, setStatus] = useState<Status>({ state: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const retriedImages = useRef(false);
  const lastOpened = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    retriedImages.current = false;
    getBucketImages(bucketId, null, controller.signal)
      .then((page) => setStatus({ state: "ready", page }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        // 404: missing, or not shared with this account (the backend never says which). 400: not an id at all.
        if (err instanceof PhotosApiError && (err.status === 404 || err.status === 400)) setStatus({ state: "unavailable" });
        else setStatus({ state: "error", message: friendlyMessage(err) });
      });
    return () => controller.abort();
  }, [bucketId, reloadKey]);

  useLayoutEffect(() => () => setOpenIndex(null), []);

  const close = useCallback(() => {
    setOpenIndex(null);
    requestAnimationFrame(() => lastOpened.current?.focus({ preventScroll: true }));
  }, []);

  if (status.state === "loading") return <CollectionSkeleton />;
  if (status.state === "unavailable") return <Unavailable bucketId={bucketId} />;
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

  const { page } = status;
  const { bucket, photos, nextCursor, hiddenPrivateCount } = page;
  // Without `bucket` (an older backend) the role is unknown, so show it read only.
  const isOwner = bucket?.role === "owner";
  const name = bucket?.name ?? "Collection";
  const hiddenNote = hiddenPhotosNote(hiddenPrivateCount);

  const updatePage = (change: (page: CollectionPage) => CollectionPage) =>
    setStatus((current) => (current.state === "ready" ? { state: "ready", page: change(current.page) } : current));

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    setActionError(null);
    try {
      const more = await getBucketImages(bucketId, nextCursor);
      updatePage((current) => {
        const seen = new Set(current.photos.map((p) => p.id));
        return { ...current, photos: [...current.photos, ...more.photos.filter((p) => !seen.has(p.id))], nextCursor: more.nextCursor };
      });
    } catch (err) {
      setActionError(friendlyMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }

  async function remove(photo: SavedPhoto) {
    setRemovingId(photo.id);
    setActionError(null);
    try {
      await removeFromBucket(bucketId, photo.id);
      updatePage((current) => ({ ...current, photos: current.photos.filter((p) => p.id !== photo.id) }));
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

  return (
    <div>
      <div className="mb-10 text-center">
        <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">{isOwner ? "Your collection" : "Shared collection"}</p>
        <h1 className="mt-3 text-5xl leading-[1.05] break-words sm:text-6xl">{name}</h1>
        {!isOwner && bucket && <p className="mt-4 text-muted">Shared by {bucket.ownerName}</p>}
        {isOwner && bucket && (
          <div className="mt-6 flex justify-center">
            <ShareCollection
              bucket={{ id: bucket.id, name: bucket.name }}
              privatePhotos={{ count: privateCount(photos), more: nextCursor !== null }}
            />
          </div>
        )}
        {hiddenNote && <p className="mt-4 text-sm text-muted">{hiddenNote}</p>}
      </div>

      {actionError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {actionError}
        </p>
      )}

      {photos.length === 0 ? (
        <EmptyState isOwner={isOwner} ownerName={bucket?.ownerName ?? "The owner"} hiddenCount={hiddenPrivateCount} />
      ) : (
        <PhotoGrid
          photos={photos}
          onOpen={(i, tile) => {
            lastOpened.current = tile;
            setOpenIndex(i);
          }}
          onImageError={onImageError}
          overlay={(photo) =>
            isOwner && (
              <button
                type="button"
                onClick={() => remove(photo)}
                disabled={removingId !== null}
                aria-label={`Remove "${photoAlt(photo)}" from ${name}`}
                title="Remove from collection"
                className={tileButtonClass}
              >
                <CloseIcon width={16} height={16} />
              </button>
            )
          }
        />
      )}

      {nextCursor && (
        <div className="mt-8 text-center">
          <button type="button" onClick={loadMore} disabled={loadingMore} className={buttonClasses("secondary", "disabled:opacity-60")}>
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {openIndex !== null && photos.length > 0 && (
        <PhotoPreview
          photos={photos.map(toPreviewPhoto)}
          index={Math.min(openIndex, photos.length - 1)}
          onClose={close}
          onChange={setOpenIndex}
          // People it was shared with only look: no save, remove or share buttons.
          actions={
            isOwner
              ? (i) =>
                  photos[i] && (
                    <div className="flex flex-col items-center gap-2 sm:items-start">
                      <button type="button" onClick={() => remove(photos[i])} disabled={removingId !== null} className={previewActionClass}>
                        <CloseIcon width={18} height={18} />
                        {removingId === photos[i].id ? "Removing…" : `Remove from ${name}`}
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
    </div>
  );
}

function EmptyState({ isOwner, ownerName, hiddenCount }: { isOwner: boolean; ownerName: string; hiddenCount: number }) {
  if (isOwner) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
        <p className="font-serif text-3xl">This collection is empty</p>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
          Browse Photogram and tap the bookmark on any photo to add it to this collection.
        </p>
        <Button href="/photogram" className="mt-6">
          Browse Photogram
        </Button>
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
      <p className="font-serif text-3xl">Nothing to see here yet</p>
      <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
        {hiddenCount > 0
          ? `Every photo in this collection is private, so only ${ownerName} can see them. Private photos are never shown to the people a collection is shared with.`
          : `${ownerName} hasn't added any photos to this collection yet.`}
      </p>
      <Button href="/photogram" className="mt-6">
        Browse Photogram
      </Button>
    </div>
  );
}

/**
 * The same message whether the collection is missing or shared with someone else, so the page never
 * gives away which. "Log in with a different account" logs out first, then comes back here.
 */
function Unavailable({ bucketId }: { bucketId: string }) {
  const { user } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function switchAccount() {
    setSwitching(true);
    setError(null);
    try {
      await logout();
    } catch {
      setSwitching(false);
      setError("Couldn't log you out. Check your connection and try again.");
      return;
    }
    // A full page load rather than the auth context's logout, which would send everyone home first.
    // It also leaves nothing of the old account in memory.
    window.location.assign(collectionLoginHref(bucketId));
  }

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
      <h1 className="font-serif text-3xl">This collection isn&apos;t available.</h1>
      <p className="mt-3 leading-relaxed text-muted">It may not exist, or it may be shared with a different account.</p>
      {user && <p className="mt-2 text-sm text-muted">You&apos;re logged in as {user.email}.</p>}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button type="button" onClick={switchAccount} disabled={switching} className={buttonClasses("primary", "disabled:opacity-60")}>
          {switching ? "Logging out…" : "Log in with a different account"}
        </button>
        <Button href="/" variant="secondary">
          Go home
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <>
      <div aria-hidden className="mb-10 flex flex-col items-center">
        <div className="shimmer h-3 w-40 rounded-full" />
        <div className="shimmer mt-4 h-12 w-72 max-w-full rounded-2xl" />
      </div>
      <PhotoGridSkeleton label="Loading the collection" />
    </>
  );
}
