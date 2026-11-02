import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The gate only needs who is logged in; the real AuthProvider talks to the backend.
type Auth = { user: { id: string; email: string; name: string; phone: null } | null; loading: boolean };
let auth: Auth = { user: null, loading: false };
vi.mock("@/components/auth/AuthProvider", () => ({ useAuth: () => auth }));

const UPLOADER = "dulhaniyaa@abhishek.in";
const userWith = (email: string): Auth => ({ user: { id: "u1", email, name: "Test", phone: null }, loading: false });

/** Loads the screen fresh, the way the route does, with the uploader email set. */
async function loadGate() {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_PHOTOGRAM_UPLOADER_EMAIL", UPLOADER);
  return (await import("./BulkUpload")).BulkUploadGate;
}

/** What rendering the gate does: its HTML, or "404" when it calls notFound(). Any other error is thrown. */
async function render(state: Auth): Promise<string> {
  auth = state;
  const BulkUploadGate = await loadGate();
  try {
    return renderToString(<BulkUploadGate />);
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String(err.digest).endsWith(";404")) return "404";
    throw err;
  }
}

describe("BulkUploadGate", () => {
  beforeEach(() => {
    auth = { user: null, loading: false };
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads without errors (every import it reads at load time is defined)", async () => {
    await expect(loadGate()).resolves.toBeTypeOf("function");
  });

  it("shows a placeholder while the session is restored", async () => {
    expect(await render({ user: null, loading: true })).toContain('aria-label="Loading"');
  });

  it("is a 404 when logged out", async () => {
    expect(await render({ user: null, loading: false })).toBe("404");
  });

  it("is a 404 for any other account", async () => {
    expect(await render(userWith("someone@else.com"))).toBe("404");
  });

  it("shows the bulk upload screen to the Photogram account, ignoring case and spaces", async () => {
    const html = await render(userWith("  DulhaniyaA@Abhishek.IN "));
    expect(html).toContain("Bulk upload");
    expect(html).toContain("Drop photos here");
  });
});
