import { describe, expect, it } from "vitest";
import { buildQuery, filtersFromParams, MAX_QUERY_LENGTH, normalizeQuery } from "./photoSearch";

describe("normalizeQuery", () => {
  it("trims and collapses spaces", () => {
    expect(normalizeQuery("  pink   lehenga ")).toBe("pink lehenga");
  });

  it(`caps the length at ${MAX_QUERY_LENGTH}`, () => {
    expect(normalizeQuery("a".repeat(300))).toHaveLength(MAX_QUERY_LENGTH);
  });
});

describe("buildQuery", () => {
  it("skips empty values and keeps 0", () => {
    expect(buildQuery({ q: "", category: undefined, cursor: null, page: 0 })).toBe("?page=0");
  });

  it("encodes values", () => {
    expect(buildQuery({ q: "pink & red", category: "lehenga" })).toBe("?q=pink+%26+red&category=lehenga");
    expect(buildQuery({ cursor: "2026-10-19T12:53:00.461311+05:30" })).toBe("?cursor=2026-10-19T12%3A53%3A00.461311%2B05%3A30");
  });

  it("returns an empty string when nothing is set", () => {
    expect(buildQuery({ q: "  " })).toBe("");
  });
});

describe("filtersFromParams", () => {
  it("reads q and category", () => {
    expect(filtersFromParams(new URLSearchParams("q=+pink+&category=saree"))).toEqual({ q: "pink", category: "saree" });
  });

  it("drops an unknown category", () => {
    expect(filtersFromParams(new URLSearchParams("category=shoes"))).toEqual({ q: "", category: "" });
  });
});
