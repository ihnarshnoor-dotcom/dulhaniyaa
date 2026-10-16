import type { MetadataRoute } from "next";
import { business } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${business.url}/sitemap.xml`,
    host: business.url,
  };
}
