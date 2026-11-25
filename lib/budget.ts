import {
  Crown,
  Flower2,
  Gem,
  Hand,
  HeartHandshake,
  Martini,
  Music,
  PartyPopper,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type {
  Level,
  Plan,
  PricingType,
  RateCard,
  ServiceItem,
} from "./facilitator";

/* ───────────── Choices shown in the budget calculator ───────────── */
// Edit these lists to change the buttons customers can tap.

// Icons come from lucide.dev; swap any for another lucide icon by name.
export const eventOptions: { name: string; icon: LucideIcon; note: string }[] =
  [
    { name: "Roka", icon: Gem, note: "The first yes" },
    { name: "Haldi", icon: Sun, note: "Turmeric & laughter" },
    { name: "Mehendi", icon: Hand, note: "Henna & dholki" },
    { name: "Sangeet", icon: Music, note: "Dance-off night" },
    { name: "Cocktail", icon: Martini, note: "Glam evening" },
    { name: "Wedding", icon: HeartHandshake, note: "The pheras" },
    { name: "Reception", icon: PartyPopper, note: "The grand finale" },
  ];

export const eventPresets = [
  { label: "Minimal wedding", events: ["Wedding", "Reception"] },
  { label: "The Great three", events: ["Mehendi", "Sangeet", "Wedding"] },
  {
    label: "Great Grand Indian wedding",
    events: ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"],
  },
];

export const cityOptions = [
  "Delhi",
  "Gurugram",
  "Noida",
  "Jaipur",
  "Udaipur",
  "Jodhpur",
  "Goa",
  "Jim Corbett",
  "Rishikesh",
  "Chandigarh",
  "Amritsar",
  "Mumbai",
];

export const guestOptions = [
  { label: "Specials", value: 100, note: "Close family" },
  { label: "Cosy", value: 200, note: "Family & dear friends" },
  { label: "Classic", value: 300, note: "The usual crowd" },
  { label: "Grand", value: 500, note: "Everyone's invited" },
  { label: "Great Grand", value: 800, note: "Mohalla included" },
  { label: "Royal", value: 1200, note: "The whole city" },
];

// Limits enforced by the facilitator server.
export const MIN_GUESTS = 1;
export const MAX_GUESTS = 5000;
export const MAX_EVENTS = 8;
export const MAX_SERVICES = 60;

export const budgetOptions = [
  { label: "Under ₹25 lakh", value: "under 25 lakh" },
  { label: "₹25 – 50 lakh", value: "25-50 lakh" },
  { label: "₹50 lakh – 1 crore", value: "50 lakh - 1 crore" },
  { label: "₹1 – 2 crore", value: "1-2 crore" },
  { label: "₹2 crore +", value: "over 2 crore" },
];

/** The next 12 months, starting this month, as "February 2027" style labels. */
export function upcomingMonths(from = new Date()) {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    return {
      value: d.toLocaleString("en-IN", { month: "long", year: "numeric" }),
      month: d.toLocaleString("en-IN", { month: "short" }),
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
    };
  });
}

/** A picked day as "14 February 2027"; ends with the month's value so the month can be read back. */
export function formatDay(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Quick picks on the services step. Each one selects every core item plus the first N items of the
 * other levels in each category (the rate card lists the popular ones first).
 * Keep the totals under MAX_SERVICES so customers have room to fine-tune.
 */
export const servicePresets: {
  label: string;
  perCategory: Partial<Record<Level, number>>;
}[] = [
  { label: "Just the essentials", perCategory: { core: Infinity } },
  { label: "Essentials + popular extras", perCategory: { core: Infinity, addon: 1 } },
  { label: "The works", perCategory: { core: Infinity, addon: 1, luxury: 1 } },
];

/** Which slice of each service's price range a vibe uses: 0 = the low end, 1 = the high end. */
export type PriceBand = readonly [number, number];
export const FULL_RANGE: PriceBand = [0, 1];

/**
 * The vibe sets the price level for the services already picked: the same services cost more
 * at a higher vibe (better vendors, richer finishes). Bands should run low to high without gaps.
 */
export const vibeOptions: {
  id: string;
  name: string;
  icon: LucideIcon;
  note: string;
  band: PriceBand;
}[] = [
  {
    id: "essential",
    name: "Essential",
    icon: Flower2,
    note: "Trusted vendors and smart choices, beautifully done",
    band: [0, 0.35],
  },
  {
    id: "elevated",
    name: "Elevated",
    icon: Sparkles,
    note: "Premium vendors and richer finishes",
    band: [0.35, 0.7],
  },
  {
    id: "royal",
    name: "Royal",
    icon: Crown,
    note: "The very best of every service, no compromises",
    band: [0.7, 1],
  },
];

export const findVibe = (id: string | null) =>
  vibeOptions.find((v) => v.id === id) ?? null;

export const levelLabels: Record<Level, string> = {
  core: "The essentials",
  addon: "Nice to add",
  luxury: "Luxury upgrades",
};

export const pricingLabels: Record<PricingType, string> = {
  flat: "one-time",
  per_guest: "per guest",
  per_event: "per event",
  per_day: "per day",
  on_request: "",
};

/* ───────────── Helpers ───────────── */

/** Ids a quick pick selects. On-request items are left for the customer to opt into. */
export function idsForPreset(
  card: RateCard,
  perCategory: Partial<Record<Level, number>>,
) {
  const ids = card.categories.flatMap((c) => {
    const taken: Partial<Record<Level, number>> = {};
    return c.items
      .filter((i) => {
        if (i.pricing_type === "on_request") return false;
        const n = (taken[i.level] ?? 0) + 1;
        if (n > (perCategory[i.level] ?? 0)) return false;
        taken[i.level] = n;
        return true;
      })
      .map((i) => i.id);
  });
  return ids.slice(0, MAX_SERVICES);
}

/**
 * Running estimate shown while the customer picks items. Only a preview:
 * the /plan response has the official numbers.
 */
export function estimate(
  card: RateCard,
  selected: Set<string>,
  guestCount: number,
  eventCount: number,
  band: PriceBand = FULL_RANGE,
) {
  let min = 0;
  let max = 0;
  let onRequest = 0;
  for (const c of card.categories) {
    for (const item of c.items) {
      if (!selected.has(item.id)) continue;
      if (
        item.pricing_type === "on_request" ||
        item.min == null ||
        item.max == null
      ) {
        onRequest++;
        continue;
      }
      const qty = multiplier(item, guestCount, eventCount);
      min += pointInRange(item.min, item.max, band[0]) * qty;
      max += pointInRange(item.min, item.max, band[1]) * qty;
    }
  }
  return { min, max, onRequest };
}

const pointInRange = (min: number, max: number, f: number) => min + (max - min) * f;

/**
 * Prices the AI's plan at the chosen vibe: every low–high pair (items, subtotals, total) is narrowed to
 * the vibe's slice of that range, so the plan matches the estimate the customer saw.
 */
export function atVibe(plan: Plan, band: PriceBand): Plan {
  const narrow = <T extends Record<string, unknown>>(o: T, minKey: keyof T, maxKey: keyof T): T => {
    const lo = o[minKey];
    const hi = o[maxKey];
    if (typeof lo !== "number" || typeof hi !== "number") return o;
    return {
      ...o,
      [minKey]: Math.round(pointInRange(lo, hi, band[0]) / 100) * 100,
      [maxKey]: Math.round(pointInRange(lo, hi, band[1]) / 100) * 100,
    };
  };
  return narrow(
    {
      ...plan,
      categories: plan.categories?.map((c) => ({
        ...narrow(c, "subtotal_min", "subtotal_max"),
        items: c.items.map((i) => narrow(i, "est_min", "est_max")),
      })),
    },
    "total_min",
    "total_max",
  );
}

function multiplier(item: ServiceItem, guestCount: number, eventCount: number) {
  if (item.pricing_type === "per_guest") return guestCount;
  if (item.pricing_type === "per_event") return Math.max(eventCount, 1);
  return 1;
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** "₹X – ₹Y", or null when either end is missing. */
export function inrRange(
  min: number | null | undefined,
  max: number | null | undefined,
) {
  if (min == null || max == null) return null;
  return min === max ? inr(min) : `${inr(min)} – ${inr(max)}`;
}

/**
 * The AI sometimes writes service ids ("perm_police_noc") in its text.
 * Swap every known id for its readable name ("Police NOC") before showing the plan.
 */
export function withReadableNames(plan: Plan, card: RateCard): Plan {
  const names = new Map(
    card.categories.flatMap((c) => c.items.map((i) => [i.id, i.name] as const)),
  );
  if (names.size === 0) return plan;
  const ids = [...names.keys()]
    .sort((a, b) => b.length - a.length)
    .map((id) => id.replace(/[^\w]/g, ""));
  const pattern = new RegExp(`\\b(${ids.join("|")})\\b`, "g");

  const clean = (value: unknown, key?: string): unknown => {
    if (typeof value === "string")
      return key === "id"
        ? value
        : value.replace(pattern, (id) => names.get(id) ?? id);
    if (Array.isArray(value)) return value.map((v) => clean(v));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, clean(v, k)]),
      );
    }
    return value;
  };
  return clean(plan) as Plan;
}
