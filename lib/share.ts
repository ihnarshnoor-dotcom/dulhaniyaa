/**
 * Share links for single photos and whole collections. Kept free of browser APIs so it can be unit tested.
 */

import type { ApiPhoto } from "./photosApi";

/** What a link points at. The API calls collections buckets. */
export type ShareTarget = { imageId: string } | { bucketId: string };

/** What a share link shows, from GET /share/:token. */
export type SharedLink = { type: "image"; photo: ApiPhoto } | { type: "bucket"; name: string; photos: ApiPhoto[] };

/** A photo link stops working this many days after it is made. Collection links last until revoked. */
export const SHARE_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/** When a photo link made at `now` expires, as the ISO time the backend expects. */
export const shareExpiry = (now: Date = new Date()) => new Date(now.getTime() + SHARE_DAYS * DAY_MS).toISOString();

/** The POST /share body: photo links expire after SHARE_DAYS, collection links never do. */
export const shareRequestBody = (target: ShareTarget, now: Date = new Date()) =>
  "imageId" in target ? { imageId: target.imageId, expiresAt: shareExpiry(now) } : { bucketId: target.bucketId };

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
 * Reads a GET /share/:token response: { type: "image", image } or { type: "bucket", bucket: { name }, images }.
 * Photos without a url are dropped. Anything else gives null.
 */
export function sharedLinkOf(data: unknown): SharedLink | null {
  if (!data || typeof data !== "object") return null;
  if ("image" in data) return isPhoto(data.image) ? { type: "image", photo: data.image } : null;
  if (!("images" in data) || !Array.isArray(data.images)) return null;
  const bucket = "bucket" in data ? data.bucket : null;
  const name = bucket && typeof bucket === "object" && "name" in bucket && typeof bucket.name === "string" ? bucket.name.trim() : "";
  return { type: "bucket", name: name || "Shared collection", photos: data.images.filter(isPhoto) };
}
