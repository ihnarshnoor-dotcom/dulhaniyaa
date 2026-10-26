/**
 * Private collections shared with specific accounts (the API calls them buckets). There is no
 * "anyone with the link" mode: the owner adds people by email, and they log in to see it.
 * Kept free of browser APIs so it can be unit tested.
 */

import { z } from "zod";
import { emailField } from "./authSchemas";
import type { ApiPhoto } from "./photosApi";
import { loginHref } from "./safeNext";

export type CollectionRole = "owner" | "member";

/** The collection and who is looking at it, from GET /buckets/:id/images. */
export type CollectionInfo = { id: string; name: string; ownerName: string; role: CollectionRole };

/** Someone the owner shared a collection with. `addedAt` is null when the response left it out. */
export type Member = { userId: string; name: string; email: string; addedAt: string | null };

/** A collection someone else shared with the signed-in user. `visibleCount` counts public photos only. */
export type SharedCollection = { id: string; name: string; ownerName: string; addedAt: string | null; visibleCount: number };

export type Person = Omit<Member, "addedAt">;

/**
 * What POST /buckets/:id/members returns: the member entry plus `emailed`, true only when the backend
 * handed a "shared with you" email to its mailer (never when re-adding someone). `member` is null when
 * the entry can't be read (the person was still added).
 */
export type AddedMember = { member: Member | null; emailed: boolean };
export type LookupResult = { found: true; person: Person } | { found: false };

/* ───────────── Links ───────────── */

/** The page that opens a collection, for its owner and its members. */
export const collectionPath = (bucketId: string) => `/collections/${encodeURIComponent(bucketId)}`;

/** The link "Copy link" copies. It only works for people who were added and are logged in. */
export const collectionLink = (origin: string, bucketId: string) => `${origin.replace(/\/+$/, "")}${collectionPath(bucketId)}`;

/** Log in, then come back to this collection. */
export const collectionLoginHref = (bucketId: string) => loginHref(collectionPath(bucketId));

/* ───────────── The "Add people by email" field ───────────── */

export const memberEmailSchema = z.object({ email: emailField("Enter their email address") });

export type MemberEmailValues = z.infer<typeof memberEmailSchema>;

/* ───────────── Reading API responses ───────────── */

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const recordOf = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

/** A list that may come bare or wrapped as { [key]: [...] }. */
function listOf(data: unknown, key: string): unknown[] {
  if (Array.isArray(data)) return data;
  const wrapped = recordOf(data)?.[key];
  return Array.isArray(wrapped) ? wrapped : [];
}

/** A count from the API: a whole number, never negative. Anything else counts as 0. */
export const countOf = (value: unknown) => (typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0);

/** Sorts by `addedAt`, oldest or newest first. Times that can't be read go last, in the order they came. */
function byAddedAt<T extends { addedAt: string | null }>(items: T[], order: "oldest" | "newest"): T[] {
  const ms = (item: T) => (item.addedAt ? Date.parse(item.addedAt) : NaN);
  return [...items].sort((a, b) => {
    const [ta, tb] = [ms(a), ms(b)];
    if (Number.isNaN(ta) || Number.isNaN(tb)) return Number(Number.isNaN(ta)) - Number(Number.isNaN(tb));
    return order === "oldest" ? ta - tb : tb - ta;
  });
}

function personOf(value: unknown): Person | null {
  const r = recordOf(value);
  const userId = text(r?.userId);
  const email = text(r?.email);
  if (!userId || !email) return null;
  return { userId, name: text(r?.name) || email, email };
}

/** One member entry, or null without a user id and email. A missing name shows the email instead. */
export function memberOf(value: unknown): Member | null {
  const person = personOf(value);
  return person && { ...person, addedAt: text(recordOf(value)?.addedAt) || null };
}

/** Oldest first, as they were added, so the newest person shows at the bottom. One entry per person. */
export function membersOf(data: unknown): Member[] {
  const byId = new Map<string, Member>();
  for (const member of listOf(data, "members").map(memberOf)) {
    if (member && !byId.has(member.userId)) byId.set(member.userId, member);
  }
  return byAddedAt([...byId.values()], "oldest");
}

export const addedMemberOf = (data: unknown): AddedMember => ({ member: memberOf(data), emailed: recordOf(data)?.emailed === true });

/** The list after adding someone: added at the bottom, or updated in place when they already had access. */
export const withMember = (members: Member[], member: Member) =>
  members.some((m) => m.userId === member.userId) ? members.map((m) => (m.userId === member.userId ? member : m)) : [...members, member];

export const withoutMember = (members: Member[], userId: string) => members.filter((m) => m.userId !== userId);

/** { found: true, userId, name, email } or { found: false }. */
export function lookupResultOf(data: unknown): LookupResult {
  const person = recordOf(data)?.found === true ? personOf(data) : null;
  return person ? { found: true, person } : { found: false };
}

/** GET /buckets/shared-with-me, newest first: the most recently shared is the one people look for. */
export function sharedCollectionsOf(data: unknown): SharedCollection[] {
  const seen = new Set<string>();
  const list: SharedCollection[] = [];
  for (const item of listOf(data, "buckets")) {
    const r = recordOf(item);
    const id = text(r?.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    list.push({
      id,
      name: text(r?.name) || "Untitled collection",
      ownerName: text(r?.ownerName) || "Someone",
      addedAt: text(r?.addedAt) || null,
      visibleCount: countOf(r?.visibleCount),
    });
  }
  return byAddedAt(list, "newest");
}

/** The `bucket` part of GET /buckets/:id/images, or null when it is missing (an older backend). */
export function collectionInfoOf(value: unknown): CollectionInfo | null {
  const r = recordOf(value);
  const id = text(r?.id);
  const role = r?.role;
  if (!id || (role !== "owner" && role !== "member")) return null;
  return { id, name: text(r?.name) || "Untitled collection", ownerName: text(r?.ownerName) || "Someone", role };
}

/* ───────────── What to tell people ───────────── */

export const privateCount = (photos: Pick<ApiPhoto, "visibility">[]) => photos.filter((p) => p.visibility === "private").length;

/**
 * For the owner's share dialog. Members only ever see public photos. `more` is true when not every
 * photo has loaded yet, so the count is a minimum. Null when there is nothing to say.
 */
export function privateShareNote(count: number, more = false): string | null {
  if (count <= 0) return null;
  const photos = count === 1 ? "private photo" : "private photos";
  return `${more ? "At least " : ""}${count} ${photos} won't be visible to people you share with.`;
}

/** Under a collection's title, from `hiddenPrivateCount`. Null when nothing is hidden. */
export function hiddenPhotosNote(count: number): string | null {
  if (count <= 0) return null;
  return count === 1 ? "1 photo is hidden because it is private." : `${count} photos are hidden because they are private.`;
}

/** The quiet line under someone just added. Null when no email went out: nothing extra is shown then. */
export const emailedNote = (emailed: boolean) => (emailed ? "We've sent them an email" : null);

/** The letter in someone's round avatar. */
export function initialOf(name: string, email = "") {
  const first = Array.from(name.trim() || email.trim())[0];
  return first ? first.toLocaleUpperCase() : "?";
}
