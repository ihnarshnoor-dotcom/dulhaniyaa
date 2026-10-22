/**
 * Client for the "facilitator" server, which holds the AI keys.
 * The browser only ever sends the customer's choices; the server writes the prompt.
 *
 * Note: the facilitator only answers browsers whose exact origin is on its
 * allow-list. If calls work in curl but fail here, ask the backend owner to
 * add this site's origin. Do not work around it in this file.
 */

// Trailing slashes are trimmed: "…app/" + "/api" would become "//api", which the server redirects and the browser blocks.
const BASE = process.env.FACILITATOR_URL;

/* ───────────── Rate card (/services) ───────────── */

export type Level = "core" | "addon" | "luxury";
export type PricingType =
  | "flat"
  | "per_guest"
  | "per_event"
  | "per_day"
  | "on_request";

export type ServiceItem = {
  id: string;
  name: string;
  level: Level;
  pricing_type: PricingType;
  min: number | null;
  max: number | null;
};

type ServiceCategory = { id: string; name: string; items: ServiceItem[] };
export type RateCard = { currency: string; categories: ServiceCategory[] };

/* ───────────── Plan (/plan) ───────────── */

export type Basics = {
  events: string[];
  city: string;
  guestCount: number;
  budget?: string;
  date?: string;
};

/** Named reference to an item. Older responses may send a plain string instead. */
type ItemRef = string | { id?: string; name: string; category?: string };

type PlanItem = {
  id: string;
  name: string;
  level?: Level;
  est_min: number | null;
  est_max: number | null;
};

export type Plan = {
  summary?: string;
  events?: { name: string; notes?: string; services?: ItemRef[] }[];
  categories?: {
    name: string;
    items: PlanItem[];
    subtotal_min: number | null;
    subtotal_max: number | null;
  }[];
  on_request?: ItemRef[];
  total_min: number | null;
  total_max: number | null;
  budget_check?: {
    status: "within" | "over" | "under" | "unknown";
    message?: string;
    trim_suggestions?: string[];
  };
  timeline?: { when: string; task: string }[];
  suggestions?: string[];
  permissions_checklist?: string[];
  disclaimer?: string;
};

/* ───────────── Requests ───────────── */

/** Thrown with message "NETWORK" when the server can't be reached, otherwise the server's error. */
export class FacilitatorError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new FacilitatorError("NETWORK");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new FacilitatorError(data?.error || "SERVER");
  return data as T;
}

export const getServices = () => request<RateCard>("/api/dulhaniyaa/services");

/** The only call that uses AI credits, so every one is logged to the console. */
export async function getPlan(basics: Basics, selectedIds: string[]) {
  const started = performance.now();
  const seconds = () => `${((performance.now() - started) / 1000).toFixed(1)}s`;
  console.log("[AI] Plan request sent", {
    basics,
    services: selectedIds.length,
    selectedIds,
  });
  try {
    const plan = await request<Plan>("/api/dulhaniyaa/plan", {
      method: "POST",
      body: JSON.stringify({ basics, selectedIds }),
    });
    console.log(`[AI] Plan received in ${seconds()}`, plan);
    return plan;
  } catch (err) {
    console.error(
      `[AI] Plan failed after ${seconds()}:`,
      err instanceof Error ? err.message : err,
    );
    throw err;
  }
}

export const itemRefName = (ref: ItemRef) =>
  typeof ref === "string" ? ref : ref.name;
