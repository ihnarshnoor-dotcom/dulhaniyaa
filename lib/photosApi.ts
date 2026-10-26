/**
 * Client for our backend (accounts, uploads, Photogram feed, collections, sharing).
 * Separate from the AI facilitator in lib/facilitator.ts, which uses FACILITATOR_URL.
 *
 * Browser only: call these from client components after mount.
 * The backend is https://api.dulhaniyaa.in unless NEXT_PUBLIC_BACKEND_URL says otherwise
 * (e.g. a local backend). Setting it to an empty value switches every backend feature off.
 *
 * Login: the access token lives in memory only (lib/authSession.ts) and the refresh token in an
 * httpOnly cookie, so every call to /login and /auth/* sends credentials.
 */

import { browserLocks, createTokenStore, sendWithAuth, singleFlight, type TokenResponse } from "./authSession";
import { errorFromResponse, NETWORK_MESSAGE, PhotosApiError } from "./photosApiErrors";
import { buildQuery, type FeedFilters } from "./photoSearch";
import {
  addedMemberOf,
  collectionInfoOf,
  countOf,
  lookupResultOf,
  membersOf,
  sharedCollectionsOf,
  type AddedMember,
  type CollectionInfo,
  type LookupResult,
  type Member,
  type SharedCollection,
} from "./collections";
import { sharedLinkOf, shareRequestBody, type SharedLink } from "./share";

export { EMAIL_NOT_FOUND_MESSAGE, friendlyMessage, isInvalidResetCode, MAKE_PUBLIC_MESSAGE, PhotosApiError } from "./photosApiErrors";

export const DEFAULT_BACKEND_URL = "https://api.dulhaniyaa.in";

// Trailing slashes are trimmed so "…/" + "/me" doesn't become "//me".
const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL).trim().replace(/\/+$/, "");

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
/**
 * One collection's photos. `bucket` says whose it is and whether the viewer owns it (null from an older
 * backend). Members see public photos only; `hiddenPrivateCount` is how many this viewer can't see.
 */
export type CollectionPage = SavedPage & { bucket: CollectionInfo | null; hiddenPrivateCount: number };

/** Alt text: title, then caption, then category. */
export const photoAlt = (p: ApiPhoto) => p.title?.trim() || p.caption?.trim() || p.category || "Photo";

/* ───────────── Session ───────────── */

const tokens = createTokenStore();

let onUnauthorized: ((redirect: boolean) => void) | null = null;

/** The AuthProvider registers how to end the session in React state and send the visitor to /login. */
export function setUnauthorizedHandler(handler: typeof onUnauthorized) {
  onUnauthorized = handler;
}

function sessionExpired(redirect: boolean) {
  tokens.clear();
  onUnauthorized?.(redirect);
}

/** Forgets the access token in this tab. */
export const clearSession = () => tokens.clear();

/** Calls `listener` whenever the access token changes (login, refresh, logout). Returns an unsubscribe function. */
export const onSessionChange = (listener: () => void) => tokens.subscribe(listener);

/** When to refresh the access token proactively (ms timestamp), or null when logged out. */
export const refreshDueAt = () => tokens.refreshAt();

/**
 * One POST /auth/refresh at a time, in this tab and across tabs. Resolves to the new access token,
 * or null when the session is over (401, or 403 when this site's origin isn't allowed). Other
 * failures (network, rate limit) are thrown and leave the session alone.
 */
export const refreshSession = singleFlight(
  async (): Promise<string | null> => {
    const version = tokens.version();
    let data: TokenResponse;
    try {
      data = await request<TokenResponse>("/auth/refresh", { method: "POST", withCookie: true });
    } catch (err) {
      if (!(err instanceof PhotosApiError && (err.status === 401 || err.status === 403))) throw err;
      if (tokens.version() !== version) return tokens.get();
      tokens.clear();
      return null;
    }
    // Logged in or out while this was on its way: that newer state wins.
    if (tokens.version() !== version) return tokens.get();
    tokens.set(data);
    return data.token;
  },
  { lockName: "dulhaniyaa.auth.refresh", locks: browserLocks() },
);

/* ───────────── Requests ───────────── */

type RequestOptions = {
  method?: string;
  /** Plain objects are sent as JSON. FormData is sent as multipart (the browser sets the header). */
  body?: unknown;
  /** Send the access token, refreshing it once on a 401. A 401 after that ends the session. */
  auth?: boolean;
  /** On a 401, end the session without redirecting to /login (used when restoring a session). */
  quiet401?: boolean;
  /** Send and accept cookies (credentials: "include"). /login and /auth/* need it for the refresh cookie. */
  withCookie?: boolean;
  signal?: AbortSignal;
};

async function request<T>(
  path: string,
  { method = "GET", body, auth = false, quiet401 = false, withCookie = false, signal }: RequestOptions = {},
): Promise<T> {
  if (!isPhotosApiEnabled) throw new PhotosApiError(0, NETWORK_MESSAGE);

  const headers: Record<string, string> = { Accept: "application/json" };
  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const send = (token?: string) =>
    fetch(`${BASE}${path}`, {
      method,
      headers: token ? { ...headers, Authorization: `Bearer ${token}` } : headers,
      body: payload,
      cache: "no-store",
      ...(withCookie && { credentials: "include" as const }),
      signal,
    });

  let res: Response | null;
  try {
    res = auth
      ? await sendWithAuth(send, { getToken: tokens.get, isExpired: () => tokens.isExpired(Date.now()), refresh: refreshSession })
      : await send();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    // A failed refresh (network, rate limit) already carries its own message.
    if (err instanceof PhotosApiError) throw err;
    throw new PhotosApiError(0, NETWORK_MESSAGE);
  }

  // No session to send: nothing to refresh from.
  if (!res) {
    sessionExpired(!quiet401);
    throw new PhotosApiError(401, "Please log in again.");
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

/** Logs in: keeps the access token in memory, and the backend sets the refresh cookie. */
export async function login(email: string, password: string): Promise<void> {
  tokens.set(await request<TokenResponse>("/login", { method: "POST", body: { email, password }, withCookie: true }));
}

/** Ends this device's session: the backend revokes it and clears the cookie. The token here is forgotten either way. */
export async function logout(): Promise<void> {
  try {
    await request<void>("/auth/logout", { method: "POST", withCookie: true });
  } finally {
    tokens.clear();
  }
}

/** Ends every session of the signed-in user, on every device, this one included. */
export async function logoutAll(): Promise<void> {
  await request<void>("/auth/logout-all", { method: "POST", auth: true, quiet401: true, withCookie: true });
  tokens.clear();
}

export const getMe = (options: { quiet401?: boolean } = {}) => request<User>("/me", { auth: true, ...options });

/**
 * Asks for a 6-digit reset code. The backend emails one only if the address has an account, but
 * answers the same either way; resolves to its message ("If an account exists…"). 429 when rate limited.
 */
export async function forgotPassword(email: string): Promise<string> {
  const message = field(await request<unknown>("/auth/forgot-password", { method: "POST", body: { email } }), "message");
  return typeof message === "string" && message.trim()
    ? message.trim()
    : "If an account exists for this email, we've sent a 6-digit code to it.";
}

export type ResetPasswordInput = { email: string; code: string; password: string; confirmPassword: string };

/**
 * Sets a new password with the emailed code (a string: "042713" keeps its zero). Doesn't log in; the
 * backend ends every session of that account. 400 with a readable `error` for bad input or a bad code.
 */
export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await request<unknown>("/auth/reset-password", { method: "POST", body: input });
}

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

/**
 * Photos in one bucket, newest save first, for its owner or a member. Anyone else gets a 404, the same
 * as for a bucket that doesn't exist.
 */
export async function getBucketImages(bucketId: string, cursor?: string | null, signal?: AbortSignal): Promise<CollectionPage> {
  const data = await request<unknown>(`/buckets/${encodeURIComponent(bucketId)}/images${buildQuery({ cursor })}`, { auth: true, signal });
  return { ...savedPage(data), bucket: collectionInfoOf(field(data, "bucket")), hiddenPrivateCount: countOf(field(data, "hiddenPrivateCount")) };
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

/* ───────────── Sharing a bucket with people ───────────── */

const membersPath = (bucketId: string) => `/buckets/${encodeURIComponent(bucketId)}/members`;

/**
 * Owner only. Is there an account with exactly this email? Call it only on an explicit "Find", never
 * while someone types: it is rate limited (429) and must not be usable to browse accounts.
 */
export async function lookupMember(bucketId: string, email: string): Promise<LookupResult> {
  return lookupResultOf(await request<unknown>(`${membersPath(bucketId)}/lookup`, { method: "POST", body: { email }, auth: true }));
}

/**
 * Owner only. Shares the bucket with the account that has this email; adding someone twice is fine.
 * 404 "Email not found", 400 for the owner's own email, 409 past 50 people, 429 when rate limited.
 * `emailed` says whether the backend sent them a "shared with you" email.
 */
export async function addMember(bucketId: string, email: string): Promise<AddedMember> {
  return addedMemberOf(await request<unknown>(membersPath(bucketId), { method: "POST", body: { email }, auth: true }));
}

/** Owner only. Who the bucket is shared with, oldest first. */
export async function listMembers(bucketId: string, signal?: AbortSignal): Promise<Member[]> {
  return membersOf(await request<unknown>(membersPath(bucketId), { auth: true, signal }));
}

/** Owner only. Takes effect on the person's next request. A 404 means they no longer had access, which counts as done. */
export async function removeMember(bucketId: string, userId: string): Promise<void> {
  try {
    await request<void>(`${membersPath(bucketId)}/${encodeURIComponent(userId)}`, { method: "DELETE", auth: true });
  } catch (err) {
    if (err instanceof PhotosApiError && err.status === 404) return;
    throw err;
  }
}

/** Buckets other people shared with the signed-in user, most recently shared first. */
export async function sharedWithMe(signal?: AbortSignal): Promise<SharedCollection[]> {
  return sharedCollectionsOf(await request<unknown>("/buckets/shared-with-me", { auth: true, signal }));
}

/* ───────────── Share links ───────────── */

/**
 * Makes a link to one of the user's public photos; it expires after 3 days. Check `canSharePhoto`
 * first: the backend refuses private photos with a 400. Collections are never shared by link.
 */
export const createShare = (imageId: string) =>
  request<{ token: string; url: string }>("/share", { method: "POST", body: shareRequestBody(imageId), auth: true });

/** Switches off one of the signed-in user's links. */
export const revokeShare = async (token: string) => {
  await request<unknown>(`/share/${encodeURIComponent(token)}/revoke`, { method: "POST", auth: true });
};

/**
 * What a share link shows: one public photo. No login needed. 404 when the link is unknown, expired,
 * switched off, or an old collection link. Each call counts as a view, so don't poll it.
 */
export async function getShare(token: string, signal?: AbortSignal): Promise<SharedLink> {
  const link = sharedLinkOf(await request<unknown>(`/share/${encodeURIComponent(token)}`, { signal }));
  if (!link) throw new PhotosApiError(404, "We couldn't find that.");
  return link;
}
