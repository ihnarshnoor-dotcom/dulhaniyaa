/**
 * Share links for single photos. Kept free of browser APIs so it can be unit tested.
 * Collections are not shared by link: they are shared with specific accounts (lib/collections.ts).
 */

import type { ApiPhoto } from "./photosApi";

/** What GET /share/:token shows: always one photo. */
export type SharedLink = { type: "image"; photo: ApiPhoto };

/** A photo link stops working this many days after it is made. */
export const SHARE_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/** When a photo link made at `now` expires, as the ISO time the backend expects. */
export const shareExpiry = (now: Date = new Date()) => new Date(now.getTime() + SHARE_DAYS * DAY_MS).toISOString();

/** The POST /share body: photo links expire after SHARE_DAYS. */
export const shareRequestBody = (imageId: string, now: Date = new Date()) => ({ imageId, expiresAt: shareExpiry(now) });

/** Anyone with a link can see the photo, so only public photos get one (the backend refuses private ones with a 400). */
export const canSharePhoto = (photo: Pick<ApiPhoto, "visibility">) => photo.visibility === "public";

/**
 * The link to send: this site's /s/<token> page. Built here instead of using the backend's `url`,
 * which points wherever the backend's FRONTEND_URL says (localhost while developing).
 */
export const shareLink = (origin: string, token: string) => `${origin.replace(/\/+$/, "")}/s/${encodeURIComponent(token)}`;

/** "1 photo", "12 photos". */
export const photoCountLabel = (count: number) => `${count} ${count === 1 ? "photo" : "photos"}`;

const isPhoto = (value: unknown): value is ApiPhoto =>
  !!value && typeof value === "object" && "url" in value && typeof value.url === "string";

/**
 * Reads a GET /share/:token response: { type: "image", image }. Anything else gives null, including
 * the { type: "bucket" } shape old collection links used to return (those links now 404).
 */
export function sharedLinkOf(data: unknown): SharedLink | null {
  if (!data || typeof data !== "object" || !("image" in data)) return null;
  return isPhoto(data.image) ? { type: "image", photo: data.image } : null;
}
