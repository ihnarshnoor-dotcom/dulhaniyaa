/**
 * Share links for single photos. Kept free of browser APIs so it can be unit tested.
 */

import type { ApiPhoto } from "./photosApi";

/** Every share link stops working this many days after it is made. */
export const SHARE_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/** When a link made at `now` expires, as the ISO time the backend expects. */
export const shareExpiry = (now: Date = new Date()) => new Date(now.getTime() + SHARE_DAYS * DAY_MS).toISOString();

/**
 * The link to send: this site's /s/<token> page. Built here instead of using the backend's `url`,
 * which points wherever the backend's FRONTEND_URL says (localhost while developing).
 */
export const shareLink = (origin: string, token: string) => `${origin.replace(/\/+$/, "")}/s/${encodeURIComponent(token)}`;

/** The photo in a GET /share/:token response ({ type: "image", image }). Collection links give null. */
export function sharedPhotoOf(data: unknown): ApiPhoto | null {
  if (!data || typeof data !== "object" || !("image" in data)) return null;
  const image = data.image;
  if (!image || typeof image !== "object" || !("url" in image) || typeof image.url !== "string") return null;
  return image as ApiPhoto;
}
