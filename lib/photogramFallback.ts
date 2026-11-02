/**
 * TEMP fallback until photogram photos are imported - delete after import.
 *
 * Decides whether the Photogram page shows the photos API feed (source=photogram) or the old
 * hardcoded list. Decided on the server from the first page: the list is used only when the
 * API is off, the request fails or times out, or the feed has no photos yet. Kept free of React
 * so it can be unit tested.
 */

import type { FeedPage } from "./photosApi";

/** "feed": the API photos. "fallback": the old list. */
export type PhotogramView = "feed" | "fallback";

/** `firstPage` is null when the backend is off or the request failed. */
export function photogramView(firstPage: FeedPage | null): PhotogramView {
  return firstPage && firstPage.photos.length > 0 ? "feed" : "fallback";
}
