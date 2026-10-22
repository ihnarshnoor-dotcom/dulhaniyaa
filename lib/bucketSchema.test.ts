import { describe, expect, it } from "vitest";
import { bucketSchema } from "./bucketSchema";

describe("bucketSchema", () => {
  it("trims the name", () => {
    expect(bucketSchema.parse({ name: "  Mehendi looks " }).name).toBe("Mehendi looks");
  });

  it("requires a name", () => {
    expect(bucketSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("caps the name at 60 characters", () => {
    expect(bucketSchema.safeParse({ name: "a".repeat(60) }).success).toBe(true);
    expect(bucketSchema.safeParse({ name: "a".repeat(61) }).success).toBe(false);
  });
});
