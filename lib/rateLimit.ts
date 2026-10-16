/**
 * Very small in-memory rate limiter: max `limit` requests per `windowMs` per key.
 *
 * Good enough to stop a single spammer hammering the form. On Vercel each
 * server instance has its own memory, so this is "best effort". If spam ever
 * becomes a real problem, swap this for Upstash Ratelimit (see README).
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Stop the map growing forever on a long-running server.
  if (hits.size > 5000) hits.clear();

  return false;
}
