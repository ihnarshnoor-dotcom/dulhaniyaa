import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const SECRET = "test-secret-do-not-leak";
const SCRIPT_URL = "https://script.google.com/macros/s/test/exec";

let ipCounter = 0;
/** Each request comes from a new IP unless one is given, so the rate limit doesn't leak between tests. */
function post(body: unknown, ip = `10.0.0.${++ipCounter}`) {
  return POST(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const validBody = { form: "lets-talk", data: { name: "  Priya  ", phone: "9810000000", guests: 200, whatsapp: true } };
const upstream = (json: unknown) => vi.fn<typeof fetch>(async () => Response.json(json));

beforeEach(() => {
  vi.stubEnv("LEADS_SCRIPT_URL", SCRIPT_URL);
  vi.stubEnv("LEADS_SCRIPT_SECRET", SECRET);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/leads", () => {
  it("returns 503 when the script settings are missing", async () => {
    vi.stubEnv("LEADS_SCRIPT_SECRET", "");
    const fetchMock = upstream({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const res = await post(validBody);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pretends to succeed for bots that fill the honeypot, without forwarding", async () => {
    const fetchMock = upstream({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const res = await post({ ...validBody, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects forms that aren't on the allowlist", async () => {
    vi.stubGlobal("fetch", upstream({ ok: true }));
    expect((await post({ ...validBody, form: "newsletter" })).status).toBe(400);
  });

  it("rejects data that isn't a flat object of plain values", async () => {
    vi.stubGlobal("fetch", upstream({ ok: true }));
    expect((await post({ form: "lets-talk", data: ["a"] })).status).toBe(400);
    expect((await post({ form: "lets-talk", data: { nested: { a: 1 } } })).status).toBe(400);
    expect((await post({ form: "lets-talk", data: { empty: null } })).status).toBe(400);
    const tooMany = Object.fromEntries(Array.from({ length: 31 }, (_, i) => [`k${i}`, "v"]));
    expect((await post({ form: "lets-talk", data: tooMany })).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
  });

  it("returns 413 for oversized data", async () => {
    const fetchMock = upstream({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const res = await post({ form: "lets-talk", data: { message: "x".repeat(5001) } });
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards trimmed data with the secret as plain text and returns 200", async () => {
    const fetchMock = upstream({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const res = await post(validBody);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(SCRIPT_URL);
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow",
      cache: "no-store",
    });
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(init.body as string)).toEqual({
      secret: SECRET,
      form: "lets-talk",
      data: { name: "Priya", phone: "9810000000", guests: 200, whatsapp: true },
    });
  });

  it("returns 502 when the script reports a failure, answers with HTML, or can't be reached", async () => {
    vi.stubGlobal("fetch", upstream({ ok: false, error: "boom" }));
    expect((await post(validBody)).status).toBe(502);

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>error</html>", { status: 500 })));
    expect((await post(validBody)).status).toBe(502);

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    expect((await post(validBody)).status).toBe(502);
  });

  it("allows 5 requests a minute per IP, then returns 429", async () => {
    vi.stubGlobal("fetch", upstream({ ok: true }));
    const ip = "203.0.113.7";
    for (let i = 0; i < 5; i++) expect((await post(validBody, ip)).status).toBe(200);
    expect((await post(validBody, ip)).status).toBe(429);
    // Another visitor is unaffected.
    expect((await post(validBody)).status).toBe(200);
  });

  it("never puts the secret or script URL in a response body", async () => {
    const bodies: string[] = [];
    const run = async (body: unknown) => bodies.push(await (await post(body)).text());

    vi.stubGlobal("fetch", upstream({ ok: true }));
    await run(validBody);
    await run({ ...validBody, form: "unknown" });
    await run({ ...validBody, website: "bot" });
    vi.stubGlobal("fetch", upstream({ ok: false, error: `bad secret ${SECRET}` }));
    await run(validBody);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(`failed ${SCRIPT_URL}`)));
    await run(validBody);
    vi.stubEnv("LEADS_SCRIPT_URL", "");
    await run(validBody);

    for (const body of bodies) {
      expect(body).not.toContain(SECRET);
      expect(body).not.toContain(SCRIPT_URL);
    }
  });
});
