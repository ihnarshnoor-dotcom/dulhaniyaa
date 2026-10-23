/**
 * The login session, kept in memory only (never in localStorage).
 *
 * The backend hands out a short-lived access token ({ token, expiresIn }) and keeps the long-lived
 * refresh token in an httpOnly cookie that JavaScript never sees. A reload therefore starts with no
 * access token, and POST /auth/refresh gets a new one from the cookie.
 *
 * Pure logic, so it can be unit tested: lib/photosApi.ts wires it to fetch.
 */

/** Refresh this long before the access token expires. */
export const REFRESH_LEAD_MS = 60_000;
/** Treat a token as expired slightly early, so it doesn't run out on the way to the server. */
const EXPIRY_MARGIN_MS = 5_000;
/** Used when the backend sends no usable `expiresIn` (access tokens last 15 minutes). */
const DEFAULT_LIFETIME_S = 15 * 60;
/** setTimeout fires immediately for delays above this (about 24.8 days). */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

/** What POST /login and POST /auth/refresh return. `expiresIn` is in seconds. */
export type TokenResponse = { token: string; expiresIn?: number };

/* ───────────── Expiry timing ───────────── */

/**
 * When a token received at `receivedAt` (ms) expires, and when to refresh it: 60 seconds early,
 * or halfway through for lifetimes of two minutes or less.
 */
export function tokenTimes(expiresIn: unknown, receivedAt: number) {
  const seconds = typeof expiresIn === "number" && Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : DEFAULT_LIFETIME_S;
  const lifetime = seconds * 1000;
  return { expiresAt: receivedAt + lifetime, refreshAt: receivedAt + Math.max(lifetime - REFRESH_LEAD_MS, lifetime / 2) };
}

/** Milliseconds from `now` until `refreshAt`, never negative and always safe to pass to setTimeout. */
export const refreshDelay = (refreshAt: number, now: number) => Math.min(Math.max(refreshAt - now, 0), MAX_TIMEOUT_MS);

/* ───────────── Token store ───────────── */

type Session = { token: string; expiresAt: number; refreshAt: number };

/** Holds the access token in memory. `version` changes on every set or clear, so a slow refresh can tell it was overtaken. */
export function createTokenStore() {
  let session: Session | null = null;
  let version = 0;
  const listeners = new Set<() => void>();

  const changed = () => {
    version += 1;
    listeners.forEach((listener) => listener());
  };

  return {
    get: () => session?.token ?? null,
    version: () => version,
    /** When to refresh proactively, or null when logged out. */
    refreshAt: () => session?.refreshAt ?? null,
    isExpired: (now: number) => session !== null && now >= session.expiresAt - EXPIRY_MARGIN_MS,
    set({ token, expiresIn }: TokenResponse, now = Date.now()) {
      session = { token, ...tokenTimes(expiresIn, now) };
      changed();
    },
    clear() {
      if (session === null) return;
      session = null;
      changed();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

/* ───────────── One refresh at a time ───────────── */

/** The part of the Web Locks API (navigator.locks) used here. */
export type LockManagerLike = { request: <T>(name: string, callback: () => Promise<T>) => Promise<T> };

/**
 * Wraps `task` so only one run is in flight: calls made meanwhile share its promise. With Web Locks,
 * runs in other tabs wait for each other too, so two tabs never send the same refresh cookie. Without
 * them (old browsers, or the lock failing) the task runs directly; the backend tolerates a brief race.
 */
export function singleFlight<T>(task: () => Promise<T>, { lockName, locks }: { lockName: string; locks?: LockManagerLike | null }) {
  let inFlight: Promise<T> | null = null;

  async function run(): Promise<T> {
    if (!locks) return task();
    let started = false;
    try {
      return await locks.request(lockName, () => {
        started = true;
        return task();
      });
    } catch (err) {
      if (started) throw err;
      return task();
    }
  }

  return () => {
    inFlight ??= run().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}

/** navigator.locks when the browser has it. */
export function browserLocks(): LockManagerLike | null {
  if (typeof navigator === "undefined" || !navigator.locks) return null;
  return navigator.locks as LockManagerLike;
}

/* ───────────── 401: refresh once, retry once ───────────── */

type AuthDeps = {
  /** The current access token, or null. */
  getToken: () => string | null;
  /** True when the current token has run out, so sending it would only earn a 401. */
  isExpired: () => boolean;
  /** One refresh (shared with other callers). Resolves to the new token, or null when the session is over. */
  refresh: () => Promise<string | null>;
};

/**
 * Sends an authenticated request. On a 401 it refreshes once and retries once. Resolves to null when
 * there is no session to send; a 401 response means the session is over. Errors from `refresh`
 * (network, rate limit) are passed on.
 */
export async function sendWithAuth(send: (token: string) => Promise<Response>, { getToken, isExpired, refresh }: AuthDeps) {
  let token = getToken();
  if (!token || isExpired()) token = await refresh();
  if (!token) return null;

  const first = await send(token);
  if (first.status !== 401) return first;

  // Another request may have refreshed while this one was on its way: use that token instead of refreshing again.
  const current = getToken();
  const fresh = current && current !== token ? current : await refresh();
  if (!fresh) return first;
  return send(fresh);
}
