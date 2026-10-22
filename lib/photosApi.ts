/**
 * Client for our backend (accounts, uploads, Photogram feed, collections, sharing).
 * Separate from the AI facilitator in lib/facilitator.ts, which uses FACILITATOR_URL.
 *
 * Browser only: call these from client components after mount.
 * The backend is https://api.dulhaniyaa.com unless BACKEND_URL says otherwise
 * (e.g. a local backend). Setting it to an empty value switches every backend feature off.
 */

import { clearToken, getToken } from "./authStorage";
import { errorFromResponse, NETWORK_MESSAGE, PhotosApiError } from "./photosApiErrors";
import { buildQuery, type FeedFilters } from "./photoSearch";

export { PhotosApiError, friendlyMessage } from "./photosApiErrors";

export const DEFAULT_BACKEND_URL = "https://api.dulhaniyaa.com";

// Trailing slashes are trimmed so "…/" + "/me" doesn't become "//me".
const BASE = (process.env.BACKEND_URL ?? DEFAULT_BACKEND_URL).trim().replace(/\/+$/, "");

export const isPhotosApiEnabled = BASE !== "";

/* ───────────── Types ───────────── */

export type Visibility = "public" | "private";

export type User = { id: string; email: string; name: string; phone: string | null };

/**
 * A photo as the API returns it. `url` and `thumb_url` are absolute. Private ones are
 * signed and expire after about an hour, so never store or cache them.
 * The Photogram feed leaves out `caption` and `created_at`.
 */
export type ApiPhoto = {
  id: string;
  title: string | null;
  caption?: string | null;
  category: string;
  tags: string[];
  visibility: Visibility;
  uploaded_by: string | null;
  url: string;
  thumb_url: string | null;
  created_at?: string;
  save_count?: number;
};

/** One of the signed-in user's own photos (from uploads or /me/uploads). */
export type OwnPhoto = ApiPhoto & { caption: string | null; created_at: string };

/** A photo inside a bucket or the saved list. */
export type SavedPhoto = ApiPhoto & { saved_at?: string; note?: string | null };

export type Bucket = { id: string; name: string };

export type FeedPage = { photos: ApiPhoto[]; nextPage: number | null };
export type UploadsPage = { photos: OwnPhoto[]; nextCursor: string | null };
export type SavedPage = { photos: SavedPhoto[]; nextCursor: string | null };

/** Alt text: title, then caption, then category. */
export const photoAlt = (p: ApiPhoto) => p.title?.trim() || p.caption?.trim() || p.category || "Photo";

/* ───────────── Session expiry ───────────── */

let onUnauthorized: ((redirect: boolean) => void) | null = null;

/** The AuthProvider registers how to end the session in React state and send the visitor to /login. */
export function setUnauthorizedHandler(handler: typeof onUnauthorized) {
  onUnauthorized = handler;
}

function sessionExpired(redirect: boolean) {
  clearToken();
  onUnauthorized?.(redirect);
}

/* ───────────── Requests ───────────── */

type RequestOptions = {
  method?: string;
  /** Plain objects are sent as JSON. FormData is sent as multipart (the browser sets the header). */
  body?: unknown;
  /** Send the saved token. A 401 then ends the session. */
  auth?: boolean;
  /** On a 401, end the session without redirecting to /login (used when restoring a session). */
  quiet401?: boolean;
  signal?: AbortSignal;
};

async function request<T>(path: string, { method = "GET", body, auth = false, quiet401 = false, signal }: RequestOptions = {}): Promise<T> {
  if (!isPhotosApiEnabled) throw new PhotosApiError(0, NETWORK_MESSAGE);

  const headers: Record<string, string> = { Accept: "application/json" };
  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (!token) {
      sessionExpired(!quiet401);
      throw new PhotosApiError(401, "Please log in again.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload, cache: "no-store", signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new PhotosApiError(0, NETWORK_MESSAGE);
  }

  if (res.status === 204) return undefined as T;
  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && auth) sessionExpired(!quiet401);
    throw errorFromResponse(res.status, data);
  }
  return data as T;
}

/** Lists come wrapped as { images: [...] }. A bare array is accepted too. */
function imagesOf<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "images" in data && Array.isArray(data.images)) return data.images as T[];
  return [];
}

function field(data: unknown, key: string): unknown {
  return data && typeof data === "object" && key in data ? (data as Record<string, unknown>)[key] : undefined;
}

/* ───────────── Auth ───────────── */

export type SignupInput = { email: string; password: string; name: string; phone?: string };

export const signup = (input: SignupInput) => request<{ id: string }>("/signup", { method: "POST", body: input });

export const login = (email: string, password: string) =>
  request<{ token: string }>("/login", { method: "POST", body: { email, password } });

export const getMe = (options: { quiet401?: boolean } = {}) => request<User>("/me", { auth: true, ...options });

/* ───────────── Photos ───────────── */

/**
 * Public Photogram feed, newest first, 30 per page. No login needed.
 * `q` matches title, caption, category and tags; `category` is an exact filter.
 */
export async function getPhotogram(page = 0, filters: Partial<FeedFilters> = {}, signal?: AbortSignal): Promise<FeedPage> {
  const data = await request<unknown>(`/photogram${buildQuery({ q: filters.q, category: filters.category, page })}`, { signal });
  const photos = imagesOf<ApiPhoto>(data);
  const nextPage = field(data, "nextPage");
  if (Array.isArray(data)) return { photos, nextPage: photos.length > 0 ? page + 1 : null };
  return { photos, nextPage: typeof nextPage === "number" ? nextPage : null };
}

/** The signed-in user's own photos, public and private, newest first. */
export async function getMyUploads(cursor?: string | null, signal?: AbortSignal): Promise<UploadsPage> {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  const data = await request<unknown>(`/me/uploads${query}`, { auth: true, signal });
  const photos = imagesOf<OwnPhoto>(data);
  const nextCursor = field(data, "nextCursor");
  if (Array.isArray(data)) return { photos, nextCursor: photos.at(-1)?.created_at ?? null };
  return { photos, nextCursor: typeof nextCursor === "string" && nextCursor ? nextCursor : null };
}

function savedPage(data: unknown): SavedPage {
  const photos = imagesOf<SavedPhoto>(data);
  const nextCursor = field(data, "nextCursor");
  if (Array.isArray(data)) return { photos, nextCursor: photos.at(-1)?.saved_at ?? null };
  return { photos, nextCursor: typeof nextCursor === "string" && nextCursor ? nextCursor : null };
}

/** Fields: image (file), category, tags (comma-separated), visibility, and optional title and caption. */
export const uploadImage = (form: FormData) => request<OwnPhoto>("/images", { method: "POST", body: form, auth: true });

export const setVisibility = async (id: string, visibility: Visibility) => {
  await request<unknown>(`/images/${encodeURIComponent(id)}/visibility`, {
    method: "PATCH",
    body: { visibility },
    auth: true,
  });
};

/**
 * Deletes one of the signed-in user's photos. The backend also removes it from saved
 * collections and stops its share links. A 404 means it is already gone, which counts as done.
 * 401 ends the session (handled by `request`); other errors, such as 429, are thrown.
 */
export async function deleteImage(id: string): Promise<void> {
  try {
    await request<void>(`/images/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
  } catch (err) {
    if (err instanceof PhotosApiError && err.status === 404) return;
    throw err;
  }
}

/* ───────────── Buckets & saved photos ───────────── */

/** The signed-in user's buckets, oldest first. */
export async function getBuckets(signal?: AbortSignal): Promise<Bucket[]> {
  const data = await request<unknown>("/buckets", { auth: true, signal });
  const buckets = Array.isArray(data) ? data : field(data, "buckets");
  return Array.isArray(buckets) ? (buckets as Bucket[]) : [];
}

/** Creates a bucket. With `imageId`, that photo is saved into it in the same step. 409 if the name is taken. */
export const createBucket = (name: string, imageId?: string) =>
  request<Bucket & { saved: boolean }>("/buckets", { method: "POST", body: { name, ...(imageId && { imageId }) }, auth: true });

/** `saved` is false when the photo was already in the bucket. */
export const saveToBucket = (bucketId: string, imageId: string) =>
  request<{ saved: boolean }>(`/buckets/${encodeURIComponent(bucketId)}/images`, { method: "POST", body: { imageId }, auth: true });

/** Removes a photo from this bucket only. */
export const removeFromBucket = (bucketId: string, imageId: string) =>
  request<void>(`/buckets/${encodeURIComponent(bucketId)}/images/${encodeURIComponent(imageId)}`, { method: "DELETE", auth: true });

/** Photos in one bucket, newest save first. */
export async function getBucketImages(bucketId: string, cursor?: string | null, signal?: AbortSignal): Promise<SavedPage> {
  const data = await request<unknown>(`/buckets/${encodeURIComponent(bucketId)}/images${buildQuery({ cursor })}`, { auth: true, signal });
  return savedPage(data);
}

/** Every saved photo, once each across all buckets. */
export async function getSaved(cursor?: string | null, signal?: AbortSignal): Promise<SavedPage> {
  return savedPage(await request<unknown>(`/me/saved${buildQuery({ cursor })}`, { auth: true, signal }));
}

/** Searches saved photos, optionally within one bucket. */
export async function searchSaved(
  { q, bucketId, cursor }: { q?: string; bucketId?: string | null; cursor?: string | null },
  signal?: AbortSignal,
): Promise<SavedPage> {
  return savedPage(await request<unknown>(`/me/saved/search${buildQuery({ q, bucketId, cursor })}`, { auth: true, signal }));
}
