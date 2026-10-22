import { describe, expect, it } from "vitest";
import { shareExpiry, shareLink, sharedPhotoOf } from "./share";

describe("shareExpiry", () => {
  it("is 3 days after now", () => {
    expect(shareExpiry(new Date("2026-10-22T10:00:00Z"))).toBe("2026-10-25T10:00:00.000Z");
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

describe("sharedPhotoOf", () => {
  const image = { id: "1", title: "honey", url: "https://api.example/p/1.jpg" };

  it("reads a photo link", () => {
    expect(sharedPhotoOf({ type: "image", image })).toEqual(image);
  });

  it("returns null for a collection link", () => {
    expect(sharedPhotoOf({ type: "bucket", bucket: { name: "a" }, images: [image] })).toBeNull();
  });

  it("returns null for anything without an image url", () => {
    expect(sharedPhotoOf(null)).toBeNull();
    expect(sharedPhotoOf({ type: "image", image: { id: "1" } })).toBeNull();
  });
});
