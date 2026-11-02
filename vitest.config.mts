import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for pure logic (schemas, the ?next check, API error mapping), API route handlers, and a few
// components rendered to HTML on the server (no browser needed).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { environment: "node", include: ["lib/**/*.test.ts", "app/**/*.test.ts", "components/**/*.test.tsx"] },
});
