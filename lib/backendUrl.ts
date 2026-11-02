/**
 * The one place that decides our backend's address (accounts, uploads, Photogram, collections, sharing).
 *
 * Set BACKEND_URL (on Vercel: https://api.dulhaniyaa.in; locally in .env.local: http://localhost:4000).
 * Browser code can't see plain BACKEND_URL, so next.config.ts copies it into NEXT_PUBLIC_BACKEND_URL
 * at build time. That copy is also the fallback here, which keeps an older .env.local that only sets
 * NEXT_PUBLIC_BACKEND_URL working.
 *
 * An empty value (BACKEND_URL=) switches every backend feature off. Not setting it at all is an
 * error in production, and means http://localhost:4000 anywhere else.
 */

export const LOCAL_BACKEND_URL = "http://localhost:4000";

export type BackendEnv = {
  BACKEND_URL?: string;
  NEXT_PUBLIC_BACKEND_URL?: string;
  NODE_ENV?: string;
};

/** The backend address without a trailing slash, or "" when the backend is switched off. */
export function resolveBackendUrl(env: BackendEnv): string {
  const value = env.BACKEND_URL ?? env.NEXT_PUBLIC_BACKEND_URL;
  if (value === undefined) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "BACKEND_URL is not set. Add it in Vercel → Settings → Environment Variables " +
          "(https://api.dulhaniyaa.in) and redeploy, or set it in .env.local for a local build.",
      );
    }
    return LOCAL_BACKEND_URL;
  }
  // Trailing slashes are trimmed so "…/" + "/me" doesn't become "//me".
  return value.trim().replace(/\/+$/, "");
}

// Each name is written out in full: Next.js only swaps in build-time values for literal
// process.env.NAME reads, so this must not loop over keys or destructure process.env.
export const BACKEND_URL = resolveBackendUrl({
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  NODE_ENV: process.env.NODE_ENV,
});
