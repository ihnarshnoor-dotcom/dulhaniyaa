import { isPhotoCategory } from "./photoCategories";

/** The photos API rejects longer search text. */
export const MAX_QUERY_LENGTH = 100;

/** Trimmed, single-spaced and short enough for the API. */
export const normalizeQuery = (raw: string) => raw.trim().replace(/\s+/g, " ").slice(0, MAX_QUERY_LENGTH);

/** "?a=1&b=x" from the non-empty values, or "" when there are none. */
export function buildQuery(params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) search.set(key, text);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export type FeedFilters = { q: string; category: string };

/** Reads Photogram filters from the page URL, dropping anything invalid. */
export function filtersFromParams(params: { get(name: string): string | null }): FeedFilters {
  const category = params.get("category") ?? "";
  return { q: normalizeQuery(params.get("q") ?? ""), category: isPhotoCategory(category) ? category : "" };
}
