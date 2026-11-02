import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ApiPhoto } from "@/lib/photosApi";
import { ABOVE_THE_FOLD } from "./PhotoBento";
import { PhotogramPhotos } from "./PhotogramPhotos";

// The save button only needs who is logged in; the real AuthProvider talks to the backend.
vi.mock("@/components/auth/AuthProvider", () => ({ useAuth: () => ({ user: null, loading: true }) }));
// The share and save buttons send logged-out visitors to /login; no router outside Next.js.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }), usePathname: () => "/photogram" }));

const photo = (i: number): ApiPhoto => ({
  id: `p${i}`,
  title: `Title ${i}`,
  alt: i === 0 ? "Bride & groom <at> the mandap" : null,
  category: "bride",
  tags: [],
  visibility: "public",
  uploaded_by: null,
  url: `https://api.example.com/p/${i}.webp`,
  thumb_url: `https://api.example.com/p/${i}_t.webp`,
});

const imgs = (html: string) => html.match(/<img[^>]*>/g) ?? [];

describe("PhotogramPhotos (server HTML)", () => {
  const photos = Array.from({ length: 10 }, (_, i) => photo(i));

  it("puts every photo of the first page in the HTML with its alt text", () => {
    const tags = imgs(renderToString(<PhotogramPhotos initial={{ photos, nextPage: null }} />));
    expect(tags).toHaveLength(10);
    expect(tags[0]).toContain('alt="Bride &amp; groom &lt;at&gt; the mandap"');
    expect(tags[1]).toContain('alt="Title 1"');
    expect(tags[1]).toContain('src="https://api.example.com/p/1_t.webp"');
  });

  it("loads the first few eagerly and the rest lazily", () => {
    const tags = imgs(renderToString(<PhotogramPhotos initial={{ photos, nextPage: null }} />));
    tags.forEach((tag, i) => expect(tag).toContain(`loading="${i < ABOVE_THE_FOLD ? "eager" : "lazy"}"`));
  });

  it("starts as a uniform grid, not hidden, since photo shapes aren't known yet", () => {
    const html = renderToString(<PhotogramPhotos initial={{ photos, nextPage: 1 }} />);
    expect(html).not.toMatch(/col-span-2|row-span-2|display:\s*none|role="status"/);
  });

  it("offers Load more when the server says there are more pages", () => {
    expect(renderToString(<PhotogramPhotos initial={{ photos, nextPage: 1 }} />)).toContain("Load more");
    expect(renderToString(<PhotogramPhotos initial={{ photos, nextPage: null }} />)).not.toContain("Load more");
  });
});
