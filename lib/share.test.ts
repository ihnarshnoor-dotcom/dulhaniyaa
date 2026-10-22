import { describe, expect, it } from "vitest";
import { photoCountLabel, shareExpiry, shareLink, sharedLinkOf, shareRequestBody } from "./share";

const now = new Date("2026-10-22T10:00:00Z");

describe("shareExpiry", () => {
  it("is 3 days after now", () => {
    expect(shareExpiry(now)).toBe("2026-10-25T10:00:00.000Z");
  });
});

describe("shareRequestBody", () => {
  it("gives photo links a 3-day expiry", () => {
    expect(shareRequestBody({ imageId: "img-1" }, now)).toEqual({ imageId: "img-1", expiresAt: "2026-10-25T10:00:00.000Z" });
  });

  it("sends collection links without an expiry", () => {
    expect(shareRequestBody({ bucketId: "b-1" }, now)).toEqual({ bucketId: "b-1" });
  });
});

describe("shareLink", () => {
  it("points at this site's /s/ page", () => {
    expect(shareLink("http://localhost:3000", "AbC-_9")).toBe("http://localhost:3000/s/AbC-_9");
  });

  it("drops a trailing slash on the origin", () => {
    expect(shareLink("https://dulhaniyaa.com/", "x")).toBe("https://dulhaniyaa.com/s/x");
  });
});

describe("photoCountLabel", () => {
  it("uses the singular for one photo", () => {
    expect(photoCountLabel(1)).toBe("1 photo");
  });

  it("uses the plural otherwise", () => {
    expect(photoCountLabel(0)).toBe("0 photos");
    expect(photoCountLabel(12)).toBe("12 photos");
  });
});

describe("sharedLinkOf", () => {
  const image = { id: "1", title: "honey", url: "https://api.example/p/1.jpg" };

  it("reads a photo link", () => {
    expect(sharedLinkOf({ type: "image", image })).toEqual({ type: "image", photo: image });
  });

  it("reads a collection link", () => {
    expect(sharedLinkOf({ type: "bucket", bucket: { name: " Reds " }, images: [image] })).toEqual({
      type: "bucket",
      name: "Reds",
      photos: [image],
    });
  });

  it("reads an empty collection", () => {
    expect(sharedLinkOf({ type: "bucket", bucket: { name: "Reds" }, images: [] })).toEqual({ type: "bucket", name: "Reds", photos: [] });
  });

  it("drops collection photos without a url and falls back to a default name", () => {
    expect(sharedLinkOf({ type: "bucket", images: [image, { id: "2" }] })).toEqual({
      type: "bucket",
      name: "Shared collection",
      photos: [image],
    });
  });

  it("returns null for anything else", () => {
    expect(sharedLinkOf(null)).toBeNull();
    expect(sharedLinkOf({ type: "image", image: { id: "1" } })).toBeNull();
    expect(sharedLinkOf({ error: "Not found" })).toBeNull();
  });
});
