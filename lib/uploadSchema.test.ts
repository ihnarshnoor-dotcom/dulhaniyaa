import { describe, expect, it } from "vitest";
import { addTags, imageFileError, MAX_TAGS, MAX_UPLOAD_BYTES, normalizeTag, uploadSchema } from "./uploadSchema";

const photo = (name = "look.jpg", type = "image/jpeg", size = 1024) => {
  const file = new File([new Uint8Array(size)], name, { type });
  return file;
};

const valid = {
  file: photo(),
  category: "lehenga",
  tags: ["pink"],
  title: "",
  caption: "",
  visibility: "public" as const,
};

const issuePaths = (result: { error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((i) => i.path.join(".")) ?? [];

describe("imageFileError", () => {
  it.each([
    ["a.jpg", "image/jpeg"],
    ["a.jpeg", "image/jpeg"],
    ["a.png", "image/png"],
    ["a.webp", "image/webp"],
    ["a.WEBP", ""],
  ])("accepts %s (%s)", (name, type) => {
    expect(imageFileError({ name, type, size: 1000 })).toBeNull();
  });

  it.each([
    ["a.gif", "image/gif"],
    ["a.heic", "image/heic"],
    ["a.pdf", "application/pdf"],
    ["a.svg", ""],
  ])("rejects %s (%s)", (name, type) => {
    expect(imageFileError({ name, type, size: 1000 })).toMatch(/JPG, PNG or WebP/);
  });

  it("allows exactly 10 MB and rejects anything larger", () => {
    expect(imageFileError({ name: "a.jpg", type: "image/jpeg", size: MAX_UPLOAD_BYTES })).toBeNull();
    expect(imageFileError({ name: "a.jpg", type: "image/jpeg", size: MAX_UPLOAD_BYTES + 1 })).toMatch(/10 MB/);
  });
});

describe("tags", () => {
  it("lowercases and trims", () => {
    expect(normalizeTag("  Bridal  Red ")).toBe("bridal red");
  });

  it("splits on commas, ignores blanks and duplicates", () => {
    expect(addTags(["pink"], "Red, PINK, , pastel,red")).toEqual(["pink", "red", "pastel"]);
  });

  it(`stops at ${MAX_TAGS}`, () => {
    const many = Array.from({ length: 12 }, (_, i) => `t${i}`).join(",");
    expect(addTags([], many)).toHaveLength(MAX_TAGS);
  });
});

describe("uploadSchema", () => {
  it("accepts a photo with a category and one tag", () => {
    expect(uploadSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a photo", () => {
    expect(issuePaths(uploadSchema.safeParse({ ...valid, file: null }))).toEqual(["file"]);
  });

  it("rejects the wrong file type", () => {
    expect(issuePaths(uploadSchema.safeParse({ ...valid, file: photo("a.gif", "image/gif") }))).toEqual(["file"]);
  });

  it("requires a known category", () => {
    expect(issuePaths(uploadSchema.safeParse({ ...valid, category: "" }))).toEqual(["category"]);
    expect(issuePaths(uploadSchema.safeParse({ ...valid, category: "shoes" }))).toEqual(["category"]);
  });

  it("requires 1 to 10 tags", () => {
    expect(issuePaths(uploadSchema.safeParse({ ...valid, tags: [] }))).toEqual(["tags"]);
    const eleven = Array.from({ length: 11 }, (_, i) => `t${i}`);
    expect(issuePaths(uploadSchema.safeParse({ ...valid, tags: eleven }))).toEqual(["tags"]);
  });

  it("only allows public or private", () => {
    expect(issuePaths(uploadSchema.safeParse({ ...valid, visibility: "friends" }))).toEqual(["visibility"]);
  });

  it("trims the optional title and caption", () => {
    const parsed = uploadSchema.parse({ ...valid, title: "  Pastel pink lehenga ", caption: " " });
    expect(parsed.title).toBe("Pastel pink lehenga");
    expect(parsed.caption).toBe("");
  });
});
