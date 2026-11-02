import { describe, expect, it } from "vitest";
import { photogramView } from "./photogramFallback";
import type { ApiPhoto } from "./photosApi";

const photo = (id: string): ApiPhoto => ({
  id,
  title: null,
  category: "bride",
  tags: [],
  visibility: "public",
  uploaded_by: null,
  url: `https://api.example.com/p/${id}.webp`,
  thumb_url: null,
});

describe("photogramView", () => {
  it("shows the API photos when there are some", () => {
    expect(photogramView({ photos: [photo("a"), photo("b")], nextPage: 1 })).toBe("feed");
  });

  it("falls back when the API has no Photogram photos", () => {
    expect(photogramView({ photos: [], nextPage: null })).toBe("fallback");
  });

  it("falls back when the request failed or the API is switched off", () => {
    expect(photogramView(null)).toBe("fallback");
  });
});
