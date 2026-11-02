"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { errorId, inputClass } from "@/components/auth/Field";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import {
  addBulkTags,
  addTagsToAll,
  BULK_TAG_LIMITS,
  cleanAlt,
  idsToUpload,
  isPhotogramUploader,
  MAX_BATCH,
  MAX_RETRIES,
  rowProblems,
  runQueue,
  takeFiles,
  titleFromFilename,
  type Intake,
  type QueueOutcome,
  type RowFields,
  type UploadState,
} from "@/lib/bulkUpload";
import { categoryLabel, photoCategories } from "@/lib/photoCategories";
import { uploadImage, type OwnPhoto } from "@/lib/photosApi";
import { loginHref } from "@/lib/safeNext";
import { acceptAttribute } from "@/lib/uploadSchema";

const BULK_PATH = "/account/upload/bulk";

/**
 * Bulk upload, only for the Photogram account (NEXT_PUBLIC_PHOTOGRAM_UPLOADER_EMAIL). Everyone else,
 * logged out included, gets the 404 page. This only hides the screen; the backend decides on its own
 * whose uploads become Photogram photos.
 */
export function BulkUploadGate() {
  const { user, loading } = useAuth();
  const allowed = !!user && isPhotogramUploader(user.email);
  // Once shown, the screen stays if the session ends mid-batch, so the list isn't lost while logging in again.
  const [unlocked, setUnlocked] = useState(false);
  if (allowed && !unlocked) setUnlocked(true);

  if (loading && !unlocked) {
    return (
      <div role="status" aria-label="Loading" className="mx-auto max-w-5xl space-y-4 px-4 py-24">
        <div className="shimmer h-10 w-64 rounded-full" />
        <div className="shimmer h-52 rounded-3xl" />
      </div>
    );
  }
  if (!allowed && !(unlocked && !user)) notFound();
  return <BulkUploader sessionEnded={!user} />;
}

type Row = RowFields & { id: string; file: File; preview: string | null; state: UploadState<OwnPhoto> };

let rowCounter = 0;
const newRowId = () => `row-${Date.now().toString(36)}-${rowCounter++}`;

function formFor(row: Row): FormData {
  const form = new FormData();
  form.append("image", row.file);
  form.append("title", row.title.trim());
  form.append("alt", cleanAlt(row.alt));
  if (row.caption.trim()) form.append("caption", row.caption.trim());
  form.append("category", row.category);
  form.append("tags", row.tags.join(","));
  // The backend makes Photogram photos public anyway.
  form.append("visibility", "public");
  return form;
}

/** Frees a photo preview's memory. */
function release(alive: Set<string>, url: string | null) {
  if (!url) return;
  URL.revokeObjectURL(url);
  alive.delete(url);
}

const isProblemFree = (row: Row) => row.state.kind === "done" || Object.keys(rowProblems(row)).length === 0;

function BulkUploader({ sessionEnded }: { sessionEnded: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [intake, setIntake] = useState<Intake<File> | null>(null);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<QueueOutcome | null>(null);
  const [dragging, setDragging] = useState(false);
  const [allCategory, setAllCategory] = useState("");
  const [allTags, setAllTags] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  // Every preview URL still alive, so all of them are released when leaving the page.
  const previews = useRef(new Set<string>());
  const rowsNow = useRef(rows);

  useEffect(() => {
    rowsNow.current = rows;
  });

  useEffect(() => {
    const alive = previews.current;
    return () => {
      alive.forEach((url) => URL.revokeObjectURL(url));
      alive.clear();
      abort.current?.abort();
    };
  }, []);

  // Leaving or reloading the page while uploading asks first.
  useEffect(() => {
    if (!running) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [running]);

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const result = takeFiles(
      rows.map((r) => r.file),
      [...list],
    );
    const added = result.accepted.map((file): Row => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return {
        id: newRowId(),
        file,
        preview,
        title: titleFromFilename(file.name),
        alt: "",
        caption: "",
        category: "",
        tags: [],
        state: { kind: "queued" },
      };
    });
    setRows((current) => [...current, ...added]);
    setIntake(result);
    setOutcome(null);
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    if (!running) addFiles(e.dataTransfer.files);
  }

  const updateRow = useCallback((id: string, patch: Partial<RowFields>) => {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const removeRow = useCallback((id: string) => {
    release(previews.current, rowsNow.current.find((r) => r.id === id)?.preview ?? null);
    setRows((current) => current.filter((r) => r.id !== id));
  }, []);

  function setRowState(id: string, state: UploadState<OwnPhoto>) {
    // An uploaded photo shows the server's thumbnail from now on, so its preview is released.
    if (state.kind === "done") release(previews.current, rowsNow.current.find((r) => r.id === id)?.preview ?? null);
    setRows((current) =>
      current.map((r) => (r.id === id ? { ...r, state, preview: state.kind === "done" ? null : r.preview } : r)),
    );
  }

  async function start(which: "pending" | "failed") {
    const ids = idsToUpload(rows, which);
    if (ids.length === 0 || running) return;
    const snapshot = new Map(rows.map((r) => [r.id, r]));
    const controller = new AbortController();
    abort.current = controller;
    setRunning(true);
    setOutcome(null);
    setRows((current) => current.map((r) => (ids.includes(r.id) ? { ...r, state: { kind: "queued" } } : r)));
    const result = await runQueue<OwnPhoto>({
      ids,
      signal: controller.signal,
      upload: (id) => uploadImage(formFor(snapshot.get(id)!), { quiet401: true }),
      onChange: setRowState,
    });
    if (abort.current === controller) abort.current = null;
    setRunning(false);
    setOutcome(result);
  }

  function applyCategory() {
    if (!allCategory) return;
    setRows((current) => current.map((r) => (r.state.kind === "done" ? r : { ...r, category: allCategory })));
  }

  function applyTags() {
    if (!allTags.trim()) return;
    setRows((current) => addTagsToAll(current, allTags));
    setAllTags("");
  }

  function fillAltFromTitles() {
    setRows((current) => current.map((r) => (r.state.kind === "done" || r.alt.trim() ? r : { ...r, alt: r.title.trim() })));
  }

  function startNewBatch() {
    setRows((current) => current.filter((r) => r.state.kind !== "done"));
    setIntake(null);
    setOutcome(null);
  }

  const total = rows.length;
  const done = rows.filter((r) => r.state.kind === "done");
  const failed = rows.filter((r) => r.state.kind === "failed").length;
  const pending = idsToUpload(rows, "pending").length;
  const needDetails = rows.filter((r) => !isProblemFree(r)).length;
  const canStart = !running && !sessionEnded && needDetails === 0;
  const finished = !running && outcome !== null;
  const notPhotogram = done.filter((r) => r.state.kind === "done" && r.state.result.source && r.state.result.source !== "photogram").length;
  const unconfirmed = done.filter((r) => r.state.kind === "done" && !r.state.result.source).length;

  const progressText = running
    ? `Uploading: ${done.length} of ${total} uploaded${failed ? `, ${failed} failed` : ""}.`
    : finished
      ? `${outcome === "cancelled" ? "Stopped. " : outcome === "unauthorized" ? "Your session ended. " : ""}${done.length} of ${total} uploaded${failed ? `, ${failed} failed` : ""}${pending - failed > 0 ? `, ${pending - failed} not uploaded` : ""}.`
      : "";

  return (
    <>
      <PageHero
        title="Bulk upload"
        subtitle="Photogram photos, up to 100 at a time. Each one needs a title, alt text, a category and at least one tag."
      />
      <section className="pb-40 sm:pb-44">
        <Container className="max-w-5xl space-y-6">
          {(sessionEnded || outcome === "unauthorized") && (
            <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              Your session ended, so uploading stopped. Nothing you entered is lost.{" "}
              <a
                href={loginHref(BULK_PATH)}
                target="_blank"
                rel="noopener"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Log in again in a new tab
              </a>
              , then come back here and press “Upload”.
            </div>
          )}

          {/* Picking photos */}
          <div>
            <label
              htmlFor="bulk-files"
              onDragOver={(e) => {
                e.preventDefault();
                if (!running) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${
                dragging ? "border-primary bg-secondary/40" : "border-ink/20 hover:border-primary/60"
              } ${running || total >= MAX_BATCH ? "pointer-events-none opacity-60" : ""}`}
            >
              <span className="font-serif text-2xl text-ink">Drop photos here</span>
              <span className="text-sm text-muted">
                or <span className="font-medium text-primary underline underline-offset-4">browse</span> · JPG, PNG or WebP,
                up to 10 MB each · {total}/{MAX_BATCH} in this batch
              </span>
            </label>
            <input
              ref={fileInput}
              id="bulk-files"
              type="file"
              multiple
              accept={acceptAttribute}
              disabled={running || total >= MAX_BATCH}
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            {intake && (intake.rejected.length > 0 || intake.duplicates > 0) && (
              <div role="alert" className="mt-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {intake.rejected.length > 0 && (
                  <ul className="space-y-1">
                    {intake.rejected.map((r, i) => (
                      <li key={`${r.name}-${i}`}>
                        <span className="font-medium">{r.name}</span>: {r.message}
                      </li>
                    ))}
                  </ul>
                )}
                {intake.duplicates > 0 && (
                  <p className={intake.rejected.length ? "mt-2" : ""}>
                    Skipped {intake.duplicates} {intake.duplicates === 1 ? "photo" : "photos"} already in this batch.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Apply to all */}
          {total > 0 && !running && (
            <div className="grid gap-4 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <label htmlFor="all-category" className="mb-2 block text-sm font-medium text-ink">
                  Category for every photo
                </label>
                <div className="flex gap-2">
                  <select id="all-category" value={allCategory} onChange={(e) => setAllCategory(e.target.value)} className={inputClass}>
                    <option value="" disabled>
                      Choose a category…
                    </option>
                    {photoCategories.map((c) => (
                      <option key={c} value={c}>
                        {categoryLabel(c)}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={applyCategory} disabled={!allCategory} className={buttonClasses("secondary", "shrink-0 px-5 disabled:opacity-50")}>
                    Apply to all
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="all-tags" className="mb-2 block text-sm font-medium text-ink">
                  Add tags to every photo
                </label>
                <div className="flex gap-2">
                  <input
                    id="all-tags"
                    value={allTags}
                    onChange={(e) => setAllTags(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyTags();
                      }
                    }}
                    placeholder="e.g. bridal, pink"
                    autoComplete="off"
                    aria-describedby="all-tags-hint"
                    className={inputClass}
                  />
                  <button type="button" onClick={applyTags} disabled={!allTags.trim()} className={buttonClasses("secondary", "shrink-0 px-5 disabled:opacity-50")}>
                    Add to all
                  </button>
                </div>
                <p id="all-tags-hint" className="mt-1.5 text-xs text-muted">
                  Comma-separated. Photos already at {BULK_TAG_LIMITS.maxTags} tags keep theirs.
                </p>
              </div>
              <div className="sm:col-span-2">
                <button type="button" onClick={fillAltFromTitles} className="text-sm font-medium text-primary underline underline-offset-4">
                  Copy titles into empty alt text
                </button>
              </div>
            </div>
          )}

          {total > 0 && (
            <ul className="space-y-4">
              {rows.map((row, i) => (
                <PhotoRow
                  key={row.id}
                  row={row}
                  index={i}
                  locked={running || row.state.kind === "done"}
                  onChange={updateRow}
                  onRemove={removeRow}
                />
              ))}
            </ul>
          )}

          {finished && done.length > 0 && (
            <div className="rounded-2xl border border-ink/10 bg-white/60 p-5 text-sm">
              <h2 className="text-2xl">Batch summary</h2>
              <p className="mt-2 text-ink">
                {done.length} uploaded{failed ? `, ${failed} failed` : ""}
                {pending - failed > 0 ? `, ${pending - failed} not uploaded` : ""}.
              </p>
              {notPhotogram > 0 ? (
                <p className="mt-2 text-red-700">
                  {notPhotogram} {notPhotogram === 1 ? "photo was" : "photos were"} saved as community photos, not Photogram. The
                  backend doesn’t treat this account as the Photogram uploader (its PHOTOGRAM_UPLOADER_EMAIL setting).
                </p>
              ) : unconfirmed > 0 ? (
                <p className="mt-2 text-muted">
                  The server didn’t say where {unconfirmed === 1 ? "1 photo" : `${unconfirmed} photos`} went, so we couldn’t confirm
                  they are Photogram photos.
                </p>
              ) : (
                <p className="mt-2 text-muted">The server confirmed every uploaded photo is a Photogram photo.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/photogram" className={buttonClasses("primary")}>
                  See them on Photogram
                </Link>
                <button type="button" onClick={startNewBatch} className={buttonClasses("secondary")}>
                  Start a new batch
                </button>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Progress and actions, always in reach on long lists */}
      {total > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-ivory/95 backdrop-blur-md">
          {/* Right padding leaves room for the floating WhatsApp button. */}
          <div className="mx-auto flex max-w-5xl flex-col gap-3 py-3 pr-20 pl-4 sm:flex-row sm:items-center sm:pr-24 sm:pl-6">
            <div className="min-w-0 flex-1">
              <div
                role="progressbar"
                aria-label="Upload progress"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={done.length}
                className="h-2 overflow-hidden rounded-full bg-secondary/60"
              >
                <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${(done.length / total) * 100}%` }} />
              </div>
              <p aria-live="polite" className="mt-1.5 text-sm text-muted">
                {progressText ||
                  (needDetails > 0
                    ? `${needDetails} of ${total} ${needDetails === 1 ? "photo needs" : "photos need"} details before uploading.`
                    : `${pending} ${pending === 1 ? "photo" : "photos"} ready to upload.`)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {running ? (
                <button type="button" onClick={() => abort.current?.abort()} className={buttonClasses("secondary")}>
                  Cancel remaining
                </button>
              ) : (
                <>
                  {failed > 0 && (
                    <button type="button" onClick={() => start("failed")} disabled={!canStart} className={buttonClasses("secondary", "disabled:opacity-50")}>
                      Retry failed ({failed})
                    </button>
                  )}
                  {pending > 0 && (
                    <button type="button" onClick={() => start("pending")} disabled={!canStart} className={buttonClasses("primary", "disabled:opacity-50")}>
                      Upload {pending} {pending === 1 ? "photo" : "photos"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function statusText(state: UploadState<OwnPhoto>, running: boolean): string {
  switch (state.kind) {
    case "queued":
      return running ? "Waiting" : "Not uploaded yet";
    case "uploading":
      return "Uploading…";
    case "retrying":
      return `${state.message} Trying again (${state.retry} of ${MAX_RETRIES})…`;
    case "done":
      return "Uploaded";
    case "failed":
      return `Failed: ${state.message}`;
  }
}

const PhotoRow = memo(function PhotoRow({
  row,
  index,
  locked,
  onChange,
  onRemove,
}: {
  row: Row;
  index: number;
  locked: boolean;
  onChange: (id: string, patch: Partial<RowFields>) => void;
  onRemove: (id: string) => void;
}) {
  const problems = row.state.kind === "done" ? {} : rowProblems(row);
  const invalid = Object.keys(problems).length > 0;
  const id = (field: string) => `${row.id}-${field}`;
  const describe = (field: keyof RowFields) => (problems[field] ? errorId(id(field)) : undefined);
  const thumb = row.state.kind === "done" ? (row.state.result.thumb_url ?? row.state.result.url) : row.preview;
  const { kind } = row.state;

  const error = (field: keyof RowFields) =>
    problems[field] && (
      <p id={errorId(id(field))} className="mt-1 text-xs text-red-700">
        {problems[field]}
      </p>
    );

  return (
    <li
      className={`rounded-2xl border p-4 sm:p-5 ${
        kind === "done" ? "border-green-700/20 bg-green-50/50" : invalid || kind === "failed" ? "border-red-300 bg-red-50/40" : "border-ink/10 bg-white/60"
      }`}
    >
      <fieldset disabled={locked} className="grid min-w-0 gap-4 sm:grid-cols-[8rem_1fr]">
        <legend className="sr-only">
          Photo {index + 1}: {row.file.name}
        </legend>
        <div className="flex items-start gap-3 sm:flex-col">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-secondary/40 sm:size-32">
            {thumb && <Image src={thumb} alt="" fill unoptimized sizes="128px" loading="lazy" className="object-cover" />}
          </div>
          <div className="min-w-0 text-xs text-muted">
            <p className="truncate" title={row.file.name}>
              {row.file.name}
            </p>
            <p>{(row.file.size / (1024 * 1024)).toFixed(1)} MB</p>
            {kind !== "done" && (
              <button
                type="button"
                onClick={() => onRemove(row.id)}
                className="mt-1 font-medium text-primary underline underline-offset-4 disabled:opacity-50"
                aria-label={`Remove ${row.file.name}`}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={id("title")} className="mb-1 block text-sm font-medium text-ink">
              Title *
            </label>
            <input
              id={id("title")}
              value={row.title}
              onChange={(e) => onChange(row.id, { title: e.target.value })}
              autoComplete="off"
              aria-invalid={!!problems.title}
              aria-describedby={describe("title")}
              className={inputClass}
            />
            {error("title")}
          </div>
          <div>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <label htmlFor={id("alt")} className="text-sm font-medium text-ink">
                Alt text *
              </label>
              <button
                type="button"
                onClick={() => onChange(row.id, { alt: row.title.trim() })}
                disabled={!row.title.trim()}
                className="text-xs font-medium text-primary underline underline-offset-4 disabled:opacity-40"
              >
                Copy from title
              </button>
            </div>
            <input
              id={id("alt")}
              value={row.alt}
              onChange={(e) => onChange(row.id, { alt: e.target.value })}
              autoComplete="off"
              placeholder="What the photo shows"
              aria-invalid={!!problems.alt}
              aria-describedby={describe("alt")}
              className={inputClass}
            />
            {error("alt")}
          </div>
          <div>
            <label htmlFor={id("category")} className="mb-1 block text-sm font-medium text-ink">
              Category *
            </label>
            <select
              id={id("category")}
              value={row.category}
              onChange={(e) => onChange(row.id, { category: e.target.value })}
              aria-invalid={!!problems.category}
              aria-describedby={describe("category")}
              className={inputClass}
            >
              <option value="" disabled>
                Choose a category…
              </option>
              {photoCategories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
            {error("category")}
          </div>
          <TagField
            id={id("tags")}
            tags={row.tags}
            onChange={(tags) => onChange(row.id, { tags })}
            error={problems.tags}
          />
          <div className="sm:col-span-2">
            <label htmlFor={id("caption")} className="mb-1 block text-sm font-medium text-ink">
              Caption (optional)
            </label>
            <textarea
              id={id("caption")}
              rows={2}
              value={row.caption}
              onChange={(e) => onChange(row.id, { caption: e.target.value })}
              aria-invalid={!!problems.caption}
              aria-describedby={describe("caption")}
              className={inputClass}
            />
            {error("caption")}
          </div>
        </div>
      </fieldset>
      <p
        className={`mt-3 text-sm font-medium ${kind === "failed" ? "text-red-700" : kind === "done" ? "text-green-800" : "text-muted"}`}
      >
        {statusText(row.state, locked && kind !== "done")}
      </p>
    </li>
  );
});

/** Tag chips like the single upload form's (Enter or a comma adds, lowercase), with the bulk limits. */
function TagField({ id, tags, onChange, error }: { id: string; tags: string[]; onChange: (tags: string[]) => void; error?: string }) {
  const [draft, setDraft] = useState("");

  function commit(text = draft) {
    if (text.trim()) onChange(addBulkTags(tags, text));
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          Tags *
        </label>
        <span className="text-xs text-muted tabular-nums">
          {tags.length}/{BULK_TAG_LIMITS.maxTags}
        </span>
      </div>
      <div
        className={`flex min-h-12 flex-wrap items-center gap-1.5 rounded-lg border bg-white/60 px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 ${
          error ? "border-red-600" : "border-ink/15"
        }`}
      >
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary py-0.5 pr-1 pl-2.5 text-xs text-primary">
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              aria-label={`Remove tag ${tag}`}
              className="grid size-6 place-items-center rounded-full transition-colors hover:bg-secondary-dark"
            >
              <CloseIcon width={12} height={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => {
            const value = e.target.value;
            if (value.includes(",")) {
              const parts = value.split(",");
              commit(parts.slice(0, -1).join(","));
              setDraft(parts.at(-1) ?? "");
            } else {
              setDraft(value);
            }
          }}
          onKeyDown={onKey}
          onBlur={() => commit()}
          disabled={tags.length >= BULK_TAG_LIMITS.maxTags}
          placeholder={tags.length >= BULK_TAG_LIMITS.maxTags ? "That's the maximum" : tags.length ? "Add another…" : "e.g. pink, bridal"}
          autoComplete="off"
          enterKeyHint="enter"
          aria-invalid={!!error}
          aria-describedby={error ? errorId(id) : undefined}
          className="min-w-24 flex-1 bg-transparent py-1 text-base text-ink placeholder:text-muted/60 focus:outline-none"
        />
      </div>
      {error && (
        <p id={errorId(id)} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
