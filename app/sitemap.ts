import type { MetadataRoute } from "next";
import { business, navLinks } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Contact isn't in the menu any more but is still a real page.
  return [...navLinks, { href: "/contact" }].map((link) => ({
    url: `${business.url}${link.href === "/" ? "" : link.href}`,
    changeFrequency: "monthly",
    priority: link.href === "/" ? 1 : link.href === "/budget-calculator" ? 0.9 : 0.8,
  }));
}
