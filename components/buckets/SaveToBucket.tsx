"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BookmarkIcon, CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { friendlyMessage, getBuckets, photoAlt, saveToBucket, type ApiPhoto, type Bucket } from "@/lib/photosApi";
import { loginHref } from "@/lib/safeNext";
import { NewBucketForm } from "./NewBucketForm";

type SaveState = "saving" | "saved" | "already";

/**
 * Round "Save" button that opens a dialog for picking (or creating) a bucket.
 * Logged-out visitors are sent to /login and brought back afterwards.
 */
export function SaveToBucket({
  photo,
  variant = "icon",
  className = "",
}: {
  photo: ApiPhoto;
  /** "icon": round bookmark for photo tiles. "labelled": pill with text, for the full-screen preview. */
  variant?: "icon" | "labelled";
  className?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [buckets, setBuckets] = useState<Bucket[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, SaveState>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  async function loadBuckets() {
    setLoadError(null);
    try {
      setBuckets(await getBuckets());
    } catch (err) {
      setLoadError(friendlyMessage(err));
    }
  }

  function openDialog() {
    if (!user) {
      router.push(loginHref(window.location.pathname + window.location.search));
      return;
    }
    setStates({});
    setSaveError(null);
    setOpen(true);
    dialog.current?.showModal();
    void loadBuckets();
  }

  async function save(bucket: Bucket) {
    setSaveError(null);
    setStates((s) => ({ ...s, [bucket.id]: "saving" }));
    try {
      const { saved } = await saveToBucket(bucket.id, photo.id);
      setStates((s) => ({ ...s, [bucket.id]: saved ? "saved" : "already" }));
    } catch (err) {
      setStates((s) => {
        const next = { ...s };
        delete next[bucket.id];
        return next;
      });
      setSaveError(friendlyMessage(err));
    }
  }

  const label = `Add "${photoAlt(photo)}" to a collection`;

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={openDialog}
          disabled={loading}
          aria-label={label}
          title="Add to collection"
          className={`grid size-10 place-items-center rounded-full bg-white/85 text-primary shadow-md backdrop-blur-md transition hover:scale-105 hover:bg-white disabled:opacity-60 ${className}`}
        >
          <BookmarkIcon width={18} height={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          disabled={loading}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-ink shadow-xl transition hover:bg-primary hover:text-white disabled:opacity-60 ${className}`}
        >
          <BookmarkIcon width={18} height={18} />
          Add to collection
        </button>
      )}

      <dialog
        ref={dialog}
        aria-labelledby={`save-title-${photo.id}`}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl bg-ivory p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 id={`save-title-${photo.id}`} className="text-3xl">
                Add to collection
              </h2>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Close"
                className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-secondary/60"
              >
                <CloseIcon width={20} height={20} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                <Image src={photo.thumb_url ?? photo.url} alt="" fill unoptimized sizes="56px" className="object-cover" />
              </div>
              <p className="line-clamp-2 text-sm text-muted">{photoAlt(photo)}</p>
            </div>

            <div className="mt-6" aria-live="polite">
              {loadError && (
                <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  {loadError}{" "}
                  <button type="button" onClick={loadBuckets} className="font-semibold text-primary underline underline-offset-4">
                    Try again
                  </button>
                </div>
              )}

              {!loadError && buckets === null && (
                <div role="status" aria-label="Loading your collections" className="space-y-2">
                  <div className="shimmer h-12 rounded-xl" />
                  <div className="shimmer h-12 rounded-xl" />
                </div>
              )}

              {buckets && buckets.length > 0 && (
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {buckets.map((bucket) => {
                    const state = states[bucket.id];
                    return (
                      <li key={bucket.id}>
                        <button
                          type="button"
                          onClick={() => save(bucket)}
                          disabled={state === "saving"}
                          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-ink/15 px-4 py-2 text-left text-sm transition-colors hover:border-primary disabled:opacity-60"
                        >
                          <span className="truncate font-medium">{bucket.name}</span>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-primary">
                            {state === "saving" && "Saving…"}
                            {state === "saved" && (
                              <>
                                <CheckIcon width={16} height={16} /> Saved
                              </>
                            )}
                            {state === "already" && "Already saved"}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {saveError && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {saveError}
                </p>
              )}

              {buckets && (
                <div className={buckets.length > 0 ? "mt-6 border-t border-ink/10 pt-5" : ""}>
                  {buckets.length === 0 && (
                    <p className="mb-4 text-sm leading-relaxed text-muted">
                      Collections keep the looks you love together. Create your first one to add this photo.
                    </p>
                  )}
                  <NewBucketForm
                    imageId={photo.id}
                    label={buckets.length === 0 ? "Name your first collection" : "Or add to a new collection"}
                    autoFocus={buckets.length === 0}
                    onCreated={(bucket) => {
                      setBuckets((list) => [...(list ?? []), bucket]);
                      setStates((s) => ({ ...s, [bucket.id]: "saved" }));
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
