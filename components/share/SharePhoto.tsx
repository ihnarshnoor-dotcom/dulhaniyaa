"use client";

import { ShareIcon } from "@/components/ui/Icons";
import { MAKE_PUBLIC_MESSAGE, photoAlt, type ApiPhoto } from "@/lib/photosApi";
import { canSharePhoto, SHARE_DAYS } from "@/lib/share";
import { ShareDialog } from "./ShareDialog";

/**
 * "Share" button for one photo, opening the share dialog with a 3-day link.
 * Only public photos can be shared: on a private one the icon button is dimmed and only says
 * "Make this photo public to share it", and the labelled one isn't shown.
 */
export function SharePhoto({
  photo,
  variant = "icon",
  className = "",
}: {
  photo: ApiPhoto;
  /** "icon": small round button for photo cards. "labelled": pill with text, for the full-screen preview. */
  variant?: "icon" | "labelled";
  className?: string;
}) {
  const isPublic = canSharePhoto(photo);
  if (variant === "labelled" && !isPublic) return null;

  return (
    <ShareDialog
      imageId={photo.id}
      heading="Share photo"
      subject={photoAlt(photo)}
      thumbnail={photo.thumb_url ?? photo.url}
      notice={`Anyone with the link can see this photo, without logging in. The link stops working after ${SHARE_DAYS} days.`}
      footnote={`Works for ${SHARE_DAYS} days.`}
      message="Look at this photo on Dulhaniyaa"
      qrFileName="dulhaniyaa-photo-qr.png"
      trigger={(open, loading) =>
        variant === "icon" ? (
          // aria-disabled rather than disabled, so the hint stays reachable by keyboard and shows on hover.
          <button
            type="button"
            onClick={isPublic ? open : undefined}
            disabled={loading}
            aria-disabled={!isPublic || undefined}
            aria-label={isPublic ? `Share "${photoAlt(photo)}"` : MAKE_PUBLIC_MESSAGE}
            title={isPublic ? "Share photo" : MAKE_PUBLIC_MESSAGE}
            className={`grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-secondary/60 hover:text-primary disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted ${className}`}
          >
            <ShareIcon width={16} height={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={open}
            disabled={loading}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-ink shadow-xl transition hover:bg-primary hover:text-white disabled:opacity-60 ${className}`}
          >
            <ShareIcon width={18} height={18} />
            Share
          </button>
        )
      }
    />
  );
}
