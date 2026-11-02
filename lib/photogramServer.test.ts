import { describe, expect, it, vi } from "vitest";
import { photogramView } from "./photogramFallback";
import { fetchFirstPhotogramPage } from "./photogramServer";

const BASE = "https://api.example.com";

const photo = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  title: `Photo ${id}`,
  alt: `Bride ${id}`,
  category: "bride",
  tags: [],
  visibility: "public",
  uploaded_by: null,
  url: `${BASE}/p/${id}.webp`,
  thumb_url: `${BASE}/p/${id}-thumb.webp`,
  ...extra,
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("fetchFirstPhotogramPage", () => {
  it("asks for page 0 of the official photos, without cookies, and reads the page", async () => {
    const fetchImpl = vi.fn(async () => json({ images: [photo("a"), photo("b")], page: 0, nextPage: 1 }));
    const page = await fetchFirstPhotogramPage({ baseUrl: BASE, fetchImpl });

    expect(page).toEqual({ photos: [photo("a"), photo("b")], nextPage: 1 });
    expect(photogramView(page)).toBe("feed");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const query = new URL(url).searchParams;
    expect(new URL(url).pathname).toBe("/photogram");
    expect(query.get("source")).toBe("photogram");
    expect(query.get("page")).toBe("0");
    expect(init.credentials).toBeUndefined();
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("reports no more pages when nextPage is null", async () => {
    const page = await fetchFirstPhotogramPage({ baseUrl: BASE, fetchImpl: async () => json({ images: [photo("a")], nextPage: null }) });
    expect(page?.nextPage).toBeNull();
  });

  it("drops photos without a url, which can't be shown", async () => {
    const fetchImpl = async () => json({ images: [photo("a"), photo("b", { url: null })], nextPage: null });
    const page = await fetchFirstPhotogramPage({ baseUrl: BASE, fetchImpl });
    expect(page?.photos.map((p) => p.id)).toEqual(["a"]);
  });

  it("resolves to null on an error status (fallback list)", async () => {
    const page = await fetchFirstPhotogramPage({ baseUrl: BASE, fetchImpl: async () => json({ error: "Boom" }, 500) });
    expect(page).toBeNull();
    expect(photogramView(page)).toBe("fallback");
  });

  it("resolves to null when the backend can't be reached", async () => {
    const fetchImpl = async () => {
      throw new TypeError("fetch failed");
    };
    expect(await fetchFirstPhotogramPage({ baseUrl: BASE, fetchImpl })).toBeNull();
  });

  it("resolves to null when the body isn't JSON", async () => {
    const fetchImpl = async () => new Response("<html>gateway</html>", { status: 200 });
    expect(await fetchFirstPhotogramPage({ baseUrl: BASE, fetchImpl })).toBeNull();
  });

  it("gives up after the timeout instead of waiting for a slow backend", async () => {
    // Never answers, but stops when the request is aborted, like real fetch.
    const fetchImpl = (_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
      });
    const started = Date.now();
    const page = await fetchFirstPhotogramPage({ baseUrl: BASE, timeoutMs: 30, fetchImpl });
    expect(page).toBeNull();
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it("falls back when the feed is empty", async () => {
    const page = await fetchFirstPhotogramPage({ baseUrl: BASE, fetchImpl: async () => json({ images: [], nextPage: null }) });
    expect(page).toEqual({ photos: [], nextPage: null });
    expect(photogramView(page)).toBe("fallback");
  });

  it("doesn't call the backend when it is switched off", async () => {
    const fetchImpl = vi.fn();
    expect(await fetchFirstPhotogramPage({ baseUrl: "", fetchImpl })).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
