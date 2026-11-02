/**
 * Bulk upload for the official Photogram account (/account/upload/bulk). Kept free of React and
 * browser-only APIs so it can be unit tested.
 */

import { isPhotoCategory } from "./photoCategories";
import { friendlyMessage, PhotosApiError } from "./photosApiErrors";
import { addTags, imageFileError, type TagLimits } from "./uploadSchema";

/** Photos uploaded at the same time. Strictly one: the backend handles one image per request. */
export const UPLOAD_CONCURRENCY = 1;
/** Photos in one batch. */
export const MAX_BATCH = 100;
/** Extra tries for one photo after a rate limit (429) or a network error. */
export const MAX_RETRIES = 2;
/** Pause before retry 1, retry 2, ... */
export const RETRY_DELAYS_MS = [2000, 5000];

/*
 * The backend's own limits for POST /images (wider than the single upload form's, which stays as it is).
 * Title, caption and category are counted like the backend counts them (JS string length); alt text
 * in characters after collapsing spaces, as the backend does, so an emoji counts as one.
 */
export const MAX_TITLE_LENGTH = 200;
export const MAX_ALT_LENGTH = 300;
export const MAX_CAPTION_LENGTH = 2000;
export const MAX_CATEGORY_LENGTH = 50;
export const BULK_TAG_LIMITS: TagLimits = { maxTags: 30, maxLength: 50 };

/** Alt text as the backend stores it: every run of spaces or newlines becomes one space, ends trimmed. */
export const cleanAlt = (raw: string) => raw.replace(/\s+/gu, " ").trim();

/* ───────────── Who may see the screen ───────────── */

/**
 * The account allowed to bulk upload, from NEXT_PUBLIC_PHOTOGRAM_UPLOADER_EMAIL. This only hides the
 * screen: the backend decides on its own which account's uploads become Photogram photos.
 */
export const PHOTOGRAM_UPLOADER_EMAIL = (process.env.NEXT_PUBLIC_PHOTOGRAM_UPLOADER_EMAIL ?? "").trim();

/** True when `email` is the configured uploader's, ignoring case and spaces. Never true when none is configured. */
export function isPhotogramUploader(email: string | null | undefined, configured = PHOTOGRAM_UPLOADER_EMAIL): boolean {
  const wanted = configured.trim().toLowerCase();
  return wanted !== "" && (email ?? "").trim().toLowerCase() === wanted;
}

/* ───────────── Picking files ───────────── */

/** "red-lehenga_final.JPG" -> "Red Lehenga Final". */
export function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]*$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .slice(0, MAX_TITLE_LENGTH)
    .trim();
}

type FileLike = { name: string; size: number; type: string };

const fileKey = (f: Pick<FileLike, "name" | "size">) => `${f.name}\u0000${f.size}`;

export type Intake<T> = {
  accepted: T[];
  /** Files that can't be uploaded, each with a message for that file. */
  rejected: { name: string; message: string }[];
  /** Files already in the batch (same name and size), skipped without a message. */
  duplicates: number;
};

/**
 * Sorts newly picked files into ones to add and ones to refuse: only JPG/PNG/WebP up to the single
 * upload's size limit, no file twice (same name and size), and no more than `max` in the batch.
 */
export function takeFiles<T extends FileLike>(existing: Pick<FileLike, "name" | "size">[], picked: T[], max = MAX_BATCH): Intake<T> {
  const seen = new Set(existing.map(fileKey));
  const result: Intake<T> = { accepted: [], rejected: [], duplicates: 0 };
  for (const file of picked) {
    if (seen.has(fileKey(file))) {
      result.duplicates++;
      continue;
    }
    const error = imageFileError(file);
    if (error) {
      result.rejected.push({ name: file.name, message: error });
      continue;
    }
    if (existing.length + result.accepted.length >= max) {
      result.rejected.push({ name: file.name, message: `Only ${max} photos fit in one batch.` });
      continue;
    }
    seen.add(fileKey(file));
    result.accepted.push(file);
  }
  return result;
}

/* ───────────── One photo's details ───────────── */

export type RowFields = { title: string; alt: string; caption: string; category: string; tags: string[] };
export type RowField = keyof RowFields;
export type RowProblems = Partial<Record<RowField, string>>;

/** What is missing or too long in one photo's details. Empty when it can be uploaded. */
export function rowProblems({ title, alt, caption, category, tags }: RowFields): RowProblems {
  const problems: RowProblems = {};
  if (!title.trim()) problems.title = "Add a title";
  else if (title.trim().length > MAX_TITLE_LENGTH) problems.title = `Keep the title to ${MAX_TITLE_LENGTH} characters or fewer`;
  const cleanedAlt = cleanAlt(alt);
  if (!cleanedAlt) problems.alt = "Add alt text";
  else if ([...cleanedAlt].length > MAX_ALT_LENGTH) problems.alt = `Keep the alt text to ${MAX_ALT_LENGTH} characters or fewer`;
  if (caption.trim().length > MAX_CAPTION_LENGTH) problems.caption = `Keep the caption to ${MAX_CAPTION_LENGTH} characters or fewer`;
  if (!isPhotoCategory(category) || category.length > MAX_CATEGORY_LENGTH) problems.category = "Choose a category";
  // The backend refuses a photo without tags, the same rule as the single upload form.
  const { maxTags, maxLength } = BULK_TAG_LIMITS;
  if (tags.length === 0) problems.tags = "Add at least one tag";
  else if (tags.length > maxTags || tags.some((t) => t.length > maxLength))
    problems.tags = `Use up to ${maxTags} tags of up to ${maxLength} characters`;
  return problems;
}

/** Adds tags (comma-separated) with the single form's normalization and the bulk limits. */
export const addBulkTags = (existing: string[], raw: string) => addTags(existing, raw, BULK_TAG_LIMITS);

/** Adds comma-separated tags to every row not uploaded yet, normalized like the single form, capped at the bulk limits. */
export const addTagsToAll = <T extends { tags: string[]; state: UploadState<unknown> }>(rows: T[], raw: string): T[] =>
  rows.map((row) => (row.state.kind === "done" ? row : { ...row, tags: addBulkTags(row.tags, raw) }));

/* ───────────── The upload queue ───────────── */

export type UploadState<R> =
  | { kind: "queued" }
  | { kind: "uploading" }
  /** Waiting before retry number `retry` after a rate limit or network error. */
  | { kind: "retrying"; retry: number; message: string }
  | { kind: "done"; result: R }
  | { kind: "failed"; message: string };

/** Rows to send: everything not uploaded yet, or only the failed ones. Uploaded rows are never sent again. */
export function idsToUpload(rows: { id: string; state: UploadState<unknown> }[], which: "pending" | "failed"): string[] {
  return rows
    .filter((r) => (which === "failed" ? r.state.kind === "failed" : r.state.kind === "queued" || r.state.kind === "failed"))
    .map((r) => r.id);
}

/** 401 stops the batch (the request already tried one token refresh). 429 and network errors are retried. */
export function classifyError(err: unknown): "unauthorized" | "retry" | "fail" {
  if (err instanceof PhotosApiError) {
    if (err.status === 401) return "unauthorized";
    if (err.status === 429 || err.status === 0) return "retry";
  }
  return "fail";
}

/** Resolves after `ms`, or rejects as soon as `signal` aborts. */
export function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/** "finished": every row was tried. "cancelled": stopped by the signal. "unauthorized": the session ended. */
export type QueueOutcome = "finished" | "cancelled" | "unauthorized";

export type QueueOptions<R> = {
  ids: string[];
  upload: (id: string) => Promise<R>;
  onChange: (id: string, state: UploadState<R>) => void;
  /**
   * Cancels the rows not started yet and any retry pause. A photo already being sent is allowed to
   * finish, so we always know whether it was saved and never upload it twice.
   */
  signal: AbortSignal;
  concurrency?: number;
  maxRetries?: number;
  retryDelaysMs?: number[];
  sleep?: (ms: number, signal: AbortSignal) => Promise<void>;
};

/**
 * Uploads the rows in order, UPLOAD_CONCURRENCY at a time. A failed row never stops the others;
 * a 401 or the signal does, and leaves the rows not uploaded as "queued".
 */
export async function runQueue<R>({
  ids,
  upload,
  onChange,
  signal,
  concurrency = UPLOAD_CONCURRENCY,
  maxRetries = MAX_RETRIES,
  retryDelaysMs = RETRY_DELAYS_MS,
  sleep = abortableSleep,
}: QueueOptions<R>): Promise<QueueOutcome> {
  let outcome: QueueOutcome = "finished";
  let next = 0;

  async function uploadOne(id: string): Promise<QueueOutcome> {
    for (let retry = 0; ; retry++) {
      onChange(id, { kind: "uploading" });
      try {
        onChange(id, { kind: "done", result: await upload(id) });
        return "finished";
      } catch (err) {
        const kind = classifyError(err);
        if (kind === "unauthorized") {
          onChange(id, { kind: "queued" });
          return "unauthorized";
        }
        if (kind === "retry" && retry < maxRetries) {
          onChange(id, { kind: "retrying", retry: retry + 1, message: friendlyMessage(err) });
          try {
            await sleep(retryDelaysMs[Math.min(retry, retryDelaysMs.length - 1)] ?? 0, signal);
          } catch {
            onChange(id, { kind: "queued" });
            return "cancelled";
          }
          continue;
        }
        onChange(id, { kind: "failed", message: friendlyMessage(err) });
        return "finished";
      }
    }
  }

  async function worker() {
    while (outcome === "finished" && next < ids.length) {
      if (signal.aborted) {
        outcome = "cancelled";
        return;
      }
      const result = await uploadOne(ids[next++]);
      if (result !== "finished" && outcome === "finished") outcome = result;
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  return outcome;
}
