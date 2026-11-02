import { describe, expect, it } from "vitest";
import { LOCAL_BACKEND_URL, resolveBackendUrl } from "./backendUrl";

const PROD = "https://api.dulhaniyaa.in";

describe("resolveBackendUrl", () => {
  it("reads BACKEND_URL", () => {
    expect(resolveBackendUrl({ BACKEND_URL: PROD, NODE_ENV: "production" })).toBe(PROD);
  });

  it("prefers BACKEND_URL over NEXT_PUBLIC_BACKEND_URL", () => {
    expect(resolveBackendUrl({ BACKEND_URL: PROD, NEXT_PUBLIC_BACKEND_URL: "http://localhost:4000" })).toBe(PROD);
  });

  it("falls back to NEXT_PUBLIC_BACKEND_URL", () => {
    expect(resolveBackendUrl({ NEXT_PUBLIC_BACKEND_URL: "http://localhost:4000", NODE_ENV: "development" })).toBe(
      "http://localhost:4000",
    );
    // The browser copy that next.config.ts inlines from BACKEND_URL.
    expect(resolveBackendUrl({ NEXT_PUBLIC_BACKEND_URL: PROD, NODE_ENV: "production" })).toBe(PROD);
  });

  it("strips trailing slashes and spaces", () => {
    expect(resolveBackendUrl({ BACKEND_URL: " https://api.dulhaniyaa.in/ " })).toBe(PROD);
    expect(resolveBackendUrl({ NEXT_PUBLIC_BACKEND_URL: "http://localhost:4000//" })).toBe("http://localhost:4000");
  });

  it("keeps an empty value, which switches the backend off", () => {
    expect(resolveBackendUrl({ BACKEND_URL: "", NODE_ENV: "production" })).toBe("");
  });

  it("throws in production when neither is set", () => {
    expect(() => resolveBackendUrl({ NODE_ENV: "production" })).toThrow(/BACKEND_URL is not set/);
  });

  it("uses the local backend outside production when neither is set", () => {
    expect(resolveBackendUrl({ NODE_ENV: "development" })).toBe(LOCAL_BACKEND_URL);
    expect(resolveBackendUrl({ NODE_ENV: "test" })).toBe(LOCAL_BACKEND_URL);
  });
});
