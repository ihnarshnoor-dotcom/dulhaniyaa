import { describe, expect, it } from "vitest";
import { imageAlt } from "./photosApi";

describe("imageAlt", () => {
  it("uses the photo's alt text first", () => {
    expect(imageAlt({ alt: " Bride at her haldi ", title: "IMG_2034" })).toBe("Bride at her haldi");
  });

  it("falls back to the title when alt is missing, null or blank", () => {
    expect(imageAlt({ title: "Pink lehenga" })).toBe("Pink lehenga");
    expect(imageAlt({ alt: null, title: "Pink lehenga" })).toBe("Pink lehenga");
    expect(imageAlt({ alt: "  ", title: "Pink lehenga" })).toBe("Pink lehenga");
  });

  it("is empty when there is neither", () => {
    expect(imageAlt({ alt: null, title: null })).toBe("");
  });

  it("keeps markup as plain text", () => {
    expect(imageAlt({ alt: "<b>Mehendi</b>", title: null })).toBe("<b>Mehendi</b>");
  });
});
