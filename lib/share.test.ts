import { describe, expect, it } from "vitest";
import { canSharePhoto, photoCountLabel, shareExpiry, shareLink, sharedLinkOf, shareRequestBody } from "./share";

const now = new Date("2026-10-22T10:00:00Z");

describe("shareExpiry", () => {
  it("is 3 days after now", () => {
    expect(shareExpiry(now)).toBe("2026-10-25T10:00:00.000Z");
  });
});

describe("shareRequestBody", () => {
  it("gives photo links a 3-day expiry", () => {
    expect(shareRequestBody("img-1", now)).toEqual({ imageId: "img-1", expiresAt: "2026-10-25T10:00:00.000Z" });
  });

  it("never sends a bucketId: collections aren't shared by link", () => {
    expect(shareRequestBody("img-1", now)).not.toHaveProperty("bucketId");
  });
});

describe("canSharePhoto", () => {
  it("allows public photos only", () => {
    expect(canSharePhoto({ visibility: "public" })).toBe(true);
    expect(canSharePhoto({ visibility: "private" })).toBe(false);
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

  it("treats an old collection link as not found", () => {
    expect(sharedLinkOf({ type: "bucket", bucket: { name: "Reds" }, images: [image] })).toBeNull();
    expect(sharedLinkOf({ type: "bucket", images: [] })).toBeNull();
  });

  it("returns null for anything else", () => {
    expect(sharedLinkOf(null)).toBeNull();
    expect(sharedLinkOf({ type: "image", image: { id: "1" } })).toBeNull();
    expect(sharedLinkOf({ error: "Not found" })).toBeNull();
  });
});
