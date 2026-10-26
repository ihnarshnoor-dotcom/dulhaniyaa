/**
 * Where to send someone after they log in. Only internal paths are allowed,
 * so a crafted ?next= link can't bounce visitors to another site.
 */
export function safeNextPath(value: string | null | undefined, fallback = "/account"): string {
  if (!value || !value.startsWith("/")) return fallback;
  // "//evil.com" is a full URL to browsers. Backslashes, tabs and newlines can turn into one too.
  if (value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  // Never loop back to the login, sign-up or forgot-password page.
  if (/^\/(?:login|register|forgot-password)(?:[/?#]|$)/.test(value)) return fallback;
  return value;
}

/** Link to the login page that returns to `path` afterwards. */
export const loginHref = (path: string) => `/login?next=${encodeURIComponent(path)}`;
