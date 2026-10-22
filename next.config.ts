import type { NextConfig } from "next";

/**
 * Settings from .env.local (see .env.example). Next.js only shows NEXT_PUBLIC_* names to browser
 * code, so these plain names are passed through here instead. Only keys that are set are passed,
 * so code defaults still apply when one is missing (an empty value is kept: BACKEND_URL= switches
 * the backend features off). Never list a secret here: these values end up in the browser.
 */
const publicSettings = ["SITE_URL", "WHATSAPP_NUMBER", "FACILITATOR_URL", "BACKEND_URL", "WEB3FORMS_ACCESS_KEY"];
const env = Object.fromEntries(
  publicSettings.flatMap((key) => (process.env[key] === undefined ? [] : [[key, process.env[key] as string]])),
);

const nextConfig: NextConfig = {
  env,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    qualities: [75],
    formats: ["image/avif", "image/webp"],
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
