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
import type { Level, Plan, PricingType, RateCard, ServiceItem } from "./facilitator";

/* ───────────── Choices shown in the budget calculator ───────────── */
// Edit these lists to change the buttons customers can tap.

// Icons come from lucide.dev; swap any for another lucide icon by name.
export const eventOptions: { name: string; icon: LucideIcon; note: string }[] = [
  { name: "Roka", icon: Gem, note: "The first yes" },
  { name: "Haldi", icon: Sun, note: "Turmeric & laughter" },
  { name: "Mehendi", icon: Hand, note: "Henna & dholki" },
  { name: "Sangeet", icon: Music, note: "Dance-off night" },
  { name: "Cocktail", icon: Martini, note: "Glam evening" },
  { name: "Wedding", icon: HeartHandshake, note: "The pheras" },
  { name: "Reception", icon: PartyPopper, note: "The grand finale" },
];

export const eventPresets = [
  { label: "Just the wedding", events: ["Wedding"] },
  { label: "The classic three", events: ["Mehendi", "Sangeet", "Wedding"] },
  { label: "Big fat Indian wedding", events: ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"] },
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
  { label: "Intimate", value: 100, note: "Close family" },
  { label: "Cosy", value: 200, note: "Family & dear friends" },
  { label: "Classic", value: 300, note: "The usual crowd" },
  { label: "Grand", value: 500, note: "Everyone's invited" },
  { label: "Big fat", value: 800, note: "Mohalla included" },
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
      year: d.getFullYear(),
    };
  });
}

/**
 * Each vibe pre-selects every core item plus the first N items of the other
 * levels in each category (the rate card lists the popular ones first).
 * Keep the totals under MAX_SERVICES so customers have room to fine-tune.
 */
export const vibeOptions: {
  id: string;
  name: string;
  icon: LucideIcon;
  note: string;
  perCategory: Partial<Record<Level, number>>;
}[] = [
  { id: "essential", name: "Essential", icon: Flower2, note: "Everything you need, beautifully done", perCategory: { core: Infinity } },
  {
    id: "elevated",
    name: "Elevated",
    icon: Sparkles,
    note: "The essentials plus crowd-pleasing extras",
    perCategory: { core: Infinity, addon: 1 },
  },
  {
    id: "royal",
    name: "Royal",
    icon: Crown,
    note: "Extras plus a luxury upgrade everywhere",
    perCategory: { core: Infinity, addon: 1, luxury: 1 },
  },
];

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

/** Ids a vibe pre-selects. On-request items are left for the customer to opt into. */
export function idsForVibe(card: RateCard, perCategory: Partial<Record<Level, number>>) {
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
export function estimate(card: RateCard, selected: Set<string>, guestCount: number, eventCount: number) {
  let min = 0;
  let max = 0;
  let onRequest = 0;
  for (const c of card.categories) {
    for (const item of c.items) {
      if (!selected.has(item.id)) continue;
      if (item.pricing_type === "on_request" || item.min == null || item.max == null) {
        onRequest++;
        continue;
      }
      const qty = multiplier(item, guestCount, eventCount);
      min += item.min * qty;
      max += item.max * qty;
    }
  }
  return { min, max, onRequest };
}

function multiplier(item: ServiceItem, guestCount: number, eventCount: number) {
  if (item.pricing_type === "per_guest") return guestCount;
  if (item.pricing_type === "per_event") return Math.max(eventCount, 1);
  return 1;
}

export const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** "₹X – ₹Y", or null when either end is missing. */
export function inrRange(min: number | null | undefined, max: number | null | undefined) {
  if (min == null || max == null) return null;
  return min === max ? inr(min) : `${inr(min)} – ${inr(max)}`;
}

/**
 * The AI sometimes writes service ids ("perm_police_noc") in its text.
 * Swap every known id for its readable name ("Police NOC") before showing the plan.
 */
export function withReadableNames(plan: Plan, card: RateCard): Plan {
  const names = new Map(card.categories.flatMap((c) => c.items.map((i) => [i.id, i.name] as const)));
  if (names.size === 0) return plan;
  const ids = [...names.keys()].sort((a, b) => b.length - a.length).map((id) => id.replace(/[^\w]/g, ""));
  const pattern = new RegExp(`\\b(${ids.join("|")})\\b`, "g");

  const clean = (value: unknown, key?: string): unknown => {
    if (typeof value === "string") return key === "id" ? value : value.replace(pattern, (id) => names.get(id) ?? id);
    if (Array.isArray(value)) return value.map((v) => clean(v));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clean(v, k)]));
    }
    return value;
  };
  return clean(plan) as Plan;
}
