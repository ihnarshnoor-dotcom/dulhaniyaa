/**
 * Hands the events picked in "Plan my wedding" to the budget calculator.
 * Kept in sessionStorage (this tab only), not the URL.
 */

import { eventOptions, MAX_EVENTS } from "./budget";

const KEY = "dulhaniyaa.planner.events";
// Ignore picks older than this, e.g. from a tab left open yesterday.
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

const knownEvents = eventOptions.map((e) => e.name);

/** Validated events from a stored handoff, in the calculator's order, or null if there's nothing usable. */
export function parseHandoff(raw: string | null, now: number): string[] | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { events?: unknown; at?: unknown };
    if (typeof data.at !== "number" || now - data.at > MAX_AGE_MS || !Array.isArray(data.events)) return null;
    const picked = new Set(data.events.filter((e): e is string => typeof e === "string"));
    const events = knownEvents.filter((name) => picked.has(name)).slice(0, MAX_EVENTS);
    return events.length > 0 ? events : null;
  } catch {
    return null;
  }
}

export function saveHandoff(events: string[]) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ events, at: Date.now() }));
  } catch {
    // Storage blocked: the calculator simply starts empty.
  }
}

export function readHandoff(): string[] | null {
  try {
    return parseHandoff(window.sessionStorage.getItem(KEY), Date.now());
  } catch {
    return null;
  }
}

export function clearHandoff() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
