import { afterEach, describe, expect, it, vi } from "vitest";
import { logLead } from "./leads";

afterEach(() => vi.unstubAllGlobals());

describe("logLead", () => {
  it("never throws when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(logLead("lets-talk", { name: "Priya" })).resolves.toBeUndefined();
  });

  it("never throws when fetch itself throws synchronously", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        throw new Error("boom");
      }),
    );
    await expect(logLead("budget-calculator", { name: "Priya" }, "bot")).resolves.toBeUndefined();
  });

  it("posts the form, data with the page path, and the honeypot to /api/leads", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { location: { pathname: "/contact" } });
    await logLead("lets-talk", { name: "Priya" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/leads");
    expect(JSON.parse(init.body as string)).toEqual({
      form: "lets-talk",
      data: { name: "Priya", page: "/contact" },
      website: "",
    });
  });
});
