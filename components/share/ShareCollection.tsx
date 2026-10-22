"use client";

import { ShareIcon } from "@/components/ui/Icons";
import type { Bucket } from "@/lib/photosApi";
import { ShareDialog } from "./ShareDialog";

/** "Share collection" button, opening the share dialog with a link that lasts until it is revoked. */
export function ShareCollection({ bucket, thumbnail, className = "" }: { bucket: Bucket; thumbnail?: string | null; className?: string }) {
  return (
    <ShareDialog
      target={{ bucketId: bucket.id }}
      heading="Share collection"
      subject={bucket.name}
      thumbnail={thumbnail}
      notice="Private photos in this collection will be visible to anyone with the link. Anyone with the link can view it until you revoke it."
      footnote="Works until you stop sharing."
      message={`Look at my collection "${bucket.name}" on Dulhaniyaa`}
      qrFileName="dulhaniyaa-collection-qr.png"
      trigger={(open, loading) => (
        <button
          type="button"
          onClick={open}
          disabled={loading}
          className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-secondary-dark disabled:opacity-60 ${className}`}
        >
          <ShareIcon width={18} height={18} />
          Share collection
        </button>
      )}
    />
  );
}
