/**
 * The forgot-password screen's logic, kept free of React and browser APIs so it can be unit tested.
 * The email, code and passwords never go in a URL: only `next` and a fixed notice key do.
 */

import { RESET_CODE_LENGTH } from "./authSchemas";
import { safeNextPath } from "./safeNext";

/** The backend sends at most one code a minute per email. */
export const RESEND_COOLDOWN_SECONDS = 60;

/** Keeps only digits, up to the code's length. Pasting "042 713" gives "042713". */
export const codeDigits = (value: string) => value.replace(/\D/g, "").slice(0, RESET_CODE_LENGTH);

/** Whole seconds until `until` (a ms timestamp), rounded up, never below 0. */
export const secondsLeft = (until: number, now: number) => Math.max(0, Math.ceil((until - now) / 1000));

export const resendLabel = (seconds: number) => (seconds > 0 ? `Resend code in ${seconds}s` : "Resend code");

export type ResetField = "email" | "code" | "password" | "confirmPassword";

/** Which field a reset-password 400 belongs to, so it can be shown next to it. Null for a form-level message. */
export function resetErrorField(message: string): ResetField | null {
  if (/email/i.test(message)) return "email";
  if (/code/i.test(message)) return "code";
  if (/do not match/i.test(message)) return "confirmPassword";
  if (/password/i.test(message)) return "password";
  return null;
}

/** Messages the login page may show, chosen by key so a crafted link can't put its own words there. */
const LOGIN_NOTICES = {
  "password-reset": "Password updated. Log in with your new password.",
} as const;

export type LoginNotice = keyof typeof LOGIN_NOTICES;

export const loginNoticeText = (key: string | null | undefined): string | null =>
  key && Object.hasOwn(LOGIN_NOTICES, key) ? LOGIN_NOTICES[key as LoginNotice] : null;

/** Adds `?next=` only when the visitor arrived with one, the same way the login and sign-up links do. */
const withNext = (path: string, nextParam: string | null) =>
  nextParam ? `${path}${path.includes("?") ? "&" : "?"}next=${encodeURIComponent(safeNextPath(nextParam))}` : path;

export const forgotPasswordHref = (nextParam: string | null) => withNext("/forgot-password", nextParam);

/** Where to go after a reset: the login page with the "Password updated" notice, keeping a safe `next`. */
export const loginAfterResetHref = (nextParam: string | null) => withNext("/login?notice=password-reset", nextParam);

/** Back to login from the forgot-password page, keeping a safe `next`. */
export const loginLinkHref = (nextParam: string | null) => withNext("/login", nextParam);
