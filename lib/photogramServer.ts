/**
 * Server-side fetch of the first page of official Photogram photos, so /photogram can put real <img>
 * tags in its HTML. No cookies, no login: the feed is public. Caching is set by the caller
 * (app/photogram/page.tsx), not here, so this stays a plain function that tests can call.
 */

import { BACKEND_URL } from "./backendUrl";
import { feedPageOf, type ApiPhoto, type FeedPage } from "./photosApi";
import { feedQuery } from "./photoSearch";

/** How long the page waits for the backend before rendering without it. */
export const SERVER_FETCH_TIMEOUT_MS = 3000;

type Options = {
  /** Defaults to BACKEND_URL (lib/backendUrl.ts). "" means the backend is switched off. */
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

const hasUrl = (photo: ApiPhoto) => typeof photo?.url === "string" && photo.url !== "";

/**
 * GET /photogram?source=photogram&page=0. Resolves to null when the backend is off, slow, down or
 * answers with an error, and never throws, so a backend problem can't break the page.
 */
export async function fetchFirstPhotogramPage({
  baseUrl = BACKEND_URL,
  timeoutMs = SERVER_FETCH_TIMEOUT_MS,
  fetchImpl = fetch,
}: Options = {}): Promise<FeedPage | null> {
  if (!baseUrl) return null;
  try {
    // The timeout also covers reading the body.
    const res = await fetchImpl(`${baseUrl}/photogram${feedQuery(0, {}, "photogram")}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const page = feedPageOf(await res.json(), 0);
    return { ...page, photos: page.photos.filter(hasUrl) };
  } catch {
    return null;
  }
}
