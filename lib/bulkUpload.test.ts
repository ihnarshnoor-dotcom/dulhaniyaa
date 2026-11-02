import { describe, expect, it } from "vitest";
import {
  addBulkTags,
  addTagsToAll,
  BULK_TAG_LIMITS,
  idsToUpload,
  isPhotogramUploader,
  MAX_ALT_LENGTH,
  MAX_BATCH,
  MAX_CAPTION_LENGTH,
  MAX_TITLE_LENGTH,
  rowProblems,
  runQueue,
  takeFiles,
  titleFromFilename,
  UPLOAD_CONCURRENCY,
  type UploadState,
} from "./bulkUpload";
import { PhotosApiError } from "./photosApiErrors";
import { addTags, MAX_TAGS, MAX_UPLOAD_BYTES } from "./uploadSchema";

describe("isPhotogramUploader", () => {
  it("matches ignoring case and spaces", () => {
    expect(isPhotogramUploader("  Photos@Dulhaniyaa.com ", "photos@dulhaniyaa.com ")).toBe(true);
  });

  it("refuses other emails, no email, and an unset setting", () => {
    expect(isPhotogramUploader("someone@else.com", "photos@dulhaniyaa.com")).toBe(false);
    expect(isPhotogramUploader(null, "photos@dulhaniyaa.com")).toBe(false);
    expect(isPhotogramUploader("", "")).toBe(false);
    expect(isPhotogramUploader("photos@dulhaniyaa.com", "  ")).toBe(false);
  });
});

describe("titleFromFilename", () => {
  it.each([
    ["red-lehenga_final.JPG", "Red Lehenga Final"],
    ["IMG_2034.jpeg", "Img 2034"],
    ["  haldi--morning__2.webp", "Haldi Morning 2"],
    ["my.photo.png", "My.photo"],
    ["no-extension", "No Extension"],
    [".jpg", ""],
  ])("%s -> %s", (name, title) => {
    expect(titleFromFilename(name)).toBe(title);
  });

  it("stays within the title limit", () => {
    expect(titleFromFilename(`${"a".repeat(300)}.jpg`).length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
  });
});

const file = (name: string, size = 1000, type = "image/jpeg") => ({ name, size, type });

describe("takeFiles", () => {
  it("accepts images and explains each refused file", () => {
    const result = takeFiles([], [file("a.jpg"), file("notes.pdf", 10, "application/pdf"), file("big.jpg", MAX_UPLOAD_BYTES + 1)]);
    expect(result.accepted.map((f) => f.name)).toEqual(["a.jpg"]);
    expect(result.rejected).toEqual([
      { name: "notes.pdf", message: "Please choose a JPG, PNG or WebP photo." },
      { name: "big.jpg", message: "That photo is over 10 MB. Please choose a smaller one." },
    ]);
  });

  it("skips duplicates by name and size, already in the batch or picked twice", () => {
    const result = takeFiles([file("a.jpg")], [file("a.jpg"), file("a.jpg", 2000), file("b.jpg"), file("b.jpg")]);
    expect(result.accepted.map((f) => `${f.name}/${f.size}`)).toEqual(["a.jpg/2000", "b.jpg/1000"]);
    expect(result.duplicates).toBe(2);
  });

  it(`stops at ${MAX_BATCH} photos`, () => {
    const existing = Array.from({ length: MAX_BATCH - 1 }, (_, i) => file(`${i}.jpg`));
    const result = takeFiles(existing, [file("last.jpg"), file("extra.jpg")]);
    expect(result.accepted.map((f) => f.name)).toEqual(["last.jpg"]);
    expect(result.rejected).toEqual([{ name: "extra.jpg", message: `Only ${MAX_BATCH} photos fit in one batch.` }]);
  });
});

describe("rowProblems", () => {
  const valid = { title: "Red Lehenga", alt: "Bride in a red lehenga", caption: "", category: "lehenga", tags: ["red"] };

  it("is empty for a complete row", () => {
    expect(rowProblems(valid)).toEqual({});
  });

  it("requires title, alt text, category and a tag", () => {
    expect(Object.keys(rowProblems({ title: " ", alt: "", caption: "", category: "", tags: [] }))).toEqual([
      "title",
      "alt",
      "category",
      "tags",
    ]);
  });

  it("refuses an unknown category and too much text", () => {
    expect(rowProblems({ ...valid, category: "shoes" })).toHaveProperty("category");
    expect(rowProblems({ ...valid, title: "a".repeat(MAX_TITLE_LENGTH + 1) })).toHaveProperty("title");
    expect(rowProblems({ ...valid, alt: "a".repeat(MAX_ALT_LENGTH + 1) })).toHaveProperty("alt");
    expect(rowProblems({ ...valid, caption: "a".repeat(MAX_CAPTION_LENGTH + 1) })).toHaveProperty("caption");
  });

  it("allows the backend's limits: title 200, alt 300, caption 2000, 30 tags", () => {
    const tags = Array.from({ length: 30 }, (_, i) => `t${i}`);
    expect(rowProblems({ ...valid, title: "a".repeat(200), alt: "a".repeat(300), caption: "a".repeat(2000), tags })).toEqual({});
    expect(rowProblems({ ...valid, tags: [...tags, "one more"] })).toHaveProperty("tags");
  });

  it("counts alt text like the backend: spaces collapsed, an emoji as one character", () => {
    expect(rowProblems({ ...valid, alt: `${"a".repeat(299)}   \n` })).toEqual({});
    expect(rowProblems({ ...valid, alt: "💍".repeat(300) })).toEqual({});
    expect(rowProblems({ ...valid, alt: "  \n " })).toHaveProperty("alt");
  });
});

describe("addTagsToAll", () => {
  const queued = { kind: "queued" } as const;

  it("normalizes like the single form and skips tags a row already has", () => {
    const rows = addTagsToAll(
      [
        { tags: ["pink"], state: queued },
        { tags: [], state: queued },
      ],
      "Pink,  Bridal  Look , ,",
    );
    expect(rows.map((r) => r.tags)).toEqual([
      ["pink", "bridal look"],
      ["pink", "bridal look"],
    ]);
  });

  it(`caps tag length at ${BULK_TAG_LIMITS.maxLength} characters`, () => {
    expect(addTagsToAll([{ tags: [], state: queued }], "a".repeat(60))[0].tags).toEqual(["a".repeat(50)]);
  });

  it(`never goes over ${BULK_TAG_LIMITS.maxTags} tags on a row`, () => {
    const full = Array.from({ length: BULK_TAG_LIMITS.maxTags }, (_, i) => `t${i}`);
    expect(addTagsToAll([{ tags: full, state: queued }], "new")[0].tags).toEqual(full);
  });

  it("leaves uploaded rows alone", () => {
    const done = { tags: ["red"], state: { kind: "done", result: "x" } as const };
    expect(addTagsToAll([done], "pink")[0].tags).toEqual(["red"]);
  });
});

describe("tag normalization", () => {
  it("lowercases, trims, collapses spaces and drops blanks and duplicates", () => {
    expect(addBulkTags(["pink"], " PINK ,Bridal   Look,, ,haldi ")).toEqual(["pink", "bridal look", "haldi"]);
  });

  it("uses the bulk limits, while the single form keeps its own", () => {
    const long = "a".repeat(60);
    expect(addBulkTags([], long)).toEqual(["a".repeat(50)]);
    expect(addTags([], long)).toEqual(["a".repeat(30)]);
    const many = Array.from({ length: 40 }, (_, i) => `t${i}`).join(",");
    expect(addBulkTags([], many)).toHaveLength(30);
    expect(addTags([], many)).toHaveLength(MAX_TAGS);
  });
});

describe("idsToUpload", () => {
  const rows: { id: string; state: UploadState<string> }[] = [
    { id: "a", state: { kind: "done", result: "x" } },
    { id: "b", state: { kind: "failed", message: "no" } },
    { id: "c", state: { kind: "queued" } },
  ];

  it("never includes uploaded rows", () => {
    expect(idsToUpload(rows, "pending")).toEqual(["b", "c"]);
    expect(idsToUpload(rows, "failed")).toEqual(["b"]);
  });
});

/** Runs the queue with a fake upload that answers from `script` per id, one answer per try. */
async function run(script: Record<string, (Error | string)[]>, options: { abortAfter?: string; abortOnSleep?: boolean } = {}) {
  const controller = new AbortController();
  const states: Record<string, UploadState<string>[]> = {};
  const calls: string[] = [];
  const sleeps: number[] = [];
  let active = 0;
  let maxActive = 0;
  const outcome = await runQueue<string>({
    ids: Object.keys(script),
    signal: controller.signal,
    upload: async (id) => {
      calls.push(id);
      active++;
      maxActive = Math.max(maxActive, active);
      await Promise.resolve();
      active--;
      const answer = script[id].shift();
      if (id === options.abortAfter) controller.abort();
      if (answer instanceof Error) throw answer;
      return answer ?? "ok";
    },
    onChange: (id, state) => (states[id] ??= []).push(state),
    sleep: async (ms) => {
      sleeps.push(ms);
      if (options.abortOnSleep) {
        controller.abort();
        throw new Error("aborted");
      }
    },
  });
  const last = (id: string) => states[id]?.at(-1)?.kind;
  return { outcome, calls, sleeps, maxActive, states, last };
}

const err = (status: number, message = "nope") => new PhotosApiError(status, message);

describe("runQueue", () => {
  it(`uploads in order, ${UPLOAD_CONCURRENCY} at a time`, async () => {
    const { outcome, calls, maxActive, last } = await run({ a: ["1"], b: ["2"], c: ["3"] });
    expect(outcome).toBe("finished");
    expect(calls).toEqual(["a", "b", "c"]);
    expect(maxActive).toBe(1);
    expect(["a", "b", "c"].map(last)).toEqual(["done", "done", "done"]);
  });

  it("keeps going after a failed row, with the server's message", async () => {
    const { outcome, calls, states, last } = await run({ a: [err(400, "Category is required")], b: ["2"] });
    expect(outcome).toBe("finished");
    expect(calls).toEqual(["a", "b"]);
    expect(states.a.at(-1)).toEqual({ kind: "failed", message: "Category is required" });
    expect(last("b")).toBe("done");
  });

  it("retries 429 and network errors twice with a pause, then fails the row", async () => {
    const { calls, sleeps, states } = await run({ a: [err(429), err(0), err(429)], b: ["2"] });
    expect(calls).toEqual(["a", "a", "a", "b"]);
    expect(sleeps).toEqual([2000, 5000]);
    expect(states.a.filter((s) => s.kind === "retrying").map((s) => s.kind === "retrying" && s.retry)).toEqual([1, 2]);
    expect(states.a.at(-1)?.kind).toBe("failed");
  });

  it("succeeds on a retry", async () => {
    const { calls, last } = await run({ a: [err(0), "1"] });
    expect(calls).toEqual(["a", "a"]);
    expect(last("a")).toBe("done");
  });

  it("does not retry other errors", async () => {
    const { calls, sleeps } = await run({ a: [err(500)] });
    expect(calls).toEqual(["a"]);
    expect(sleeps).toEqual([]);
  });

  it("stops on 401 and leaves that row and the rest queued", async () => {
    const { outcome, calls, last } = await run({ a: ["1"], b: [err(401)], c: ["3"] });
    expect(outcome).toBe("unauthorized");
    expect(calls).toEqual(["a", "b"]);
    expect([last("a"), last("b"), last("c")]).toEqual(["done", "queued", undefined]);
  });

  it("cancel lets the photo being sent finish and skips the rest", async () => {
    const { outcome, calls, last } = await run({ a: ["1"], b: ["2"], c: ["3"] }, { abortAfter: "a" });
    expect(outcome).toBe("cancelled");
    expect(calls).toEqual(["a"]);
    expect([last("a"), last("b")]).toEqual(["done", undefined]);
  });

  it("cancel during a retry pause puts that row back in the queue", async () => {
    const { outcome, calls, last } = await run({ a: [err(429)], b: ["2"] }, { abortOnSleep: true });
    expect(outcome).toBe("cancelled");
    expect(calls).toEqual(["a"]);
    expect(last("a")).toBe("queued");
  });
});
