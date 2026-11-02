import type { NextConfig } from "next";
import { resolveBackendUrl } from "./lib/backendUrl";

/**
 * Settings from .env.local (see .env.example). Next.js only shows NEXT_PUBLIC_* names to browser
 * code, so these plain names are passed through here instead. Only keys that are set are passed,
 * so code defaults still apply when one is missing. Never list a secret here: these values end up
 * in the browser.
 */
const publicSettings = ["SITE_URL", "WHATSAPP_NUMBER", "FACILITATOR_URL", "WEB3FORMS_ACCESS_KEY"];

/**
 * The backend address, from BACKEND_URL (the variable set on Vercel). It is copied into
 * NEXT_PUBLIC_BACKEND_URL so browser code gets the same value; lib/backendUrl.ts reads both.
 * A production build stops here with a clear error when it isn't set.
 */
const backendUrl = resolveBackendUrl({
  BACKEND_URL: process.env.BACKEND_URL,
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  NODE_ENV: process.env.NODE_ENV,
});

const env = {
  ...Object.fromEntries(
    publicSettings.flatMap((key) => (process.env[key] === undefined ? [] : [[key, process.env[key] as string]])),
  ),
  NEXT_PUBLIC_BACKEND_URL: backendUrl,
};

/**
 * Photos from our backend may be shown with next/image, so its host is allowed here, taken from the
 * same backendUrl. Query strings are allowed because private photo links are signed.
 */
const backendImages = (() => {
  if (!backendUrl) return [];
  try {
    const { protocol, hostname, port } = new URL(backendUrl);
    if (protocol !== "http:" && protocol !== "https:") return [];
    return [{ protocol: protocol === "http:" ? ("http" as const) : ("https" as const), hostname, port, pathname: "/**" }];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  env,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    qualities: [75],
    formats: ["image/avif", "image/webp"],
    remotePatterns: backendImages,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
