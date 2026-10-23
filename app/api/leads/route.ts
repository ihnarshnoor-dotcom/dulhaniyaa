/**
 * Copies each lead into the team's Google Sheet through a Google Apps Script web app.
 * The browser calls this route (lib/leads.ts) so the script URL and its secret stay on the server.
 * The script makes one tab per `form` and adds a column for every new `data` key.
 *
 * Runs on Node.js, the default. There is no `export const runtime`: Next.js rejects it while
 * cacheComponents is on (next.config.ts).
 */

/** Forms allowed to write to the sheet. Each name becomes a tab. */
const FORMS = ["lets-talk", "budget-calculator"] as const;
export type LeadFormName = (typeof FORMS)[number];

const MAX_KEYS = 30;
const MAX_KEY_LENGTH = 60;
const MAX_DATA_JSON = 5000;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60_000;

/* ───────────── Per-IP rate limit (in memory, so per server instance) ───────────── */

const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, now = Date.now()) {
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    // Drop expired entries now and then so the map can't grow without bound.
    if (hits.size > 10_000) for (const [key, e] of hits) if (e.resetAt <= now) hits.delete(key);
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

const clientIp = (request: Request) =>
  request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";

/* ───────────── Validation ───────────── */

type LeadData = Record<string, string | number | boolean>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype;

const isForm = (value: unknown): value is LeadFormName =>
  typeof value === "string" && (FORMS as readonly string[]).includes(value);

/** Returns the cleaned data (strings trimmed), or null if it isn't a small flat object of plain values. */
function cleanData(value: unknown): LeadData | null {
  if (!isPlainObject(value)) return null;
  const entries = Object.entries(value);
  if (entries.length > MAX_KEYS) return null;
  const data: LeadData = {};
  for (const [key, v] of entries) {
    if (!key || key.length > MAX_KEY_LENGTH) return null;
    if (typeof v === "string") data[key] = v.trim();
    else if ((typeof v === "number" && Number.isFinite(v)) || typeof v === "boolean") data[key] = v;
    else return null;
  }
  return data;
}

/* ───────────── Handler ───────────── */

const reply = (status: number, ok = status === 200) => Response.json({ ok }, { status });

export async function POST(request: Request) {
  const url = process.env.LEADS_SCRIPT_URL;
  const secret = process.env.LEADS_SCRIPT_SECRET;
  if (!url || !secret) {
    console.error("[Leads] LEADS_SCRIPT_URL or LEADS_SCRIPT_SECRET is not set");
    return reply(503);
  }

  if (isRateLimited(clientIp(request))) return reply(429);

  // Cheap guard before parsing: a valid body is a little more than its data.
  const raw = await request.text();
  if (raw.length > MAX_DATA_JSON * 2) return reply(413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply(400);
  }
  if (!isPlainObject(body)) return reply(400);

  // Honeypot: real visitors never see the field, so pretend it worked and drop it.
  if (typeof body.website === "string" && body.website.trim() !== "") return reply(200);

  const { form } = body;
  if (!isForm(form)) return reply(400);

  const data = cleanData(body.data);
  if (!data) return reply(400);
  if (JSON.stringify(data).length > MAX_DATA_JSON) return reply(413);

  let ok = false;
  try {
    const res = await fetch(url, {
      method: "POST",
      // The script parses e.postData.contents itself, so the JSON goes as plain text.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ secret, form, data }),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const result: unknown = await res.json().catch(() => null);
    ok = isPlainObject(result) && result.ok === true;
  } catch {
    ok = false;
  }

  const status = ok ? 200 : 502;
  console.log(`[Leads] ${form}: ${status}`);
  return reply(status);
}
