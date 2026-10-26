import { describe, expect, it } from "vitest";
import {
  codeDigits,
  forgotPasswordHref,
  loginAfterResetHref,
  loginLinkHref,
  loginNoticeText,
  RESEND_COOLDOWN_SECONDS,
  resendLabel,
  resetErrorField,
  secondsLeft,
} from "./passwordReset";

describe("codeDigits", () => {
  it("keeps a leading zero and stays a string", () => {
    expect(codeDigits("042713")).toBe("042713");
  });

  it("drops spaces, dashes and letters from a pasted code", () => {
    expect(codeDigits(" 042-713 ")).toBe("042713");
    expect(codeDigits("04a2b7")).toBe("0427");
  });

  it("stops at 6 digits", () => {
    expect(codeDigits("12345678")).toBe("123456");
  });
});

describe("resend countdown", () => {
  const start = 1_000_000;
  const until = start + RESEND_COOLDOWN_SECONDS * 1000;

  it("waits a minute", () => {
    expect(RESEND_COOLDOWN_SECONDS).toBe(60);
    expect(secondsLeft(until, start)).toBe(60);
  });

  it("rounds part of a second up", () => {
    expect(secondsLeft(until, start + 1)).toBe(60);
    expect(secondsLeft(until, start + 1000)).toBe(59);
    expect(secondsLeft(until, until - 1)).toBe(1);
  });

  it("ends at 0 and never goes below", () => {
    expect(secondsLeft(until, until)).toBe(0);
    expect(secondsLeft(until, until + 5000)).toBe(0);
    expect(secondsLeft(0, start)).toBe(0);
  });

  it("labels the button", () => {
    expect(resendLabel(42)).toBe("Resend code in 42s");
    expect(resendLabel(0)).toBe("Resend code");
  });
});

describe("resetErrorField", () => {
  it.each([
    ["A valid email is required", "email"],
    ["The code must be 6 digits", "code"],
    ["Invalid or expired code", "code"],
    ["Password must be at least 8 characters", "password"],
    ["Password must be at most 72 bytes", "password"],
    ["Passwords do not match", "confirmPassword"],
  ])("puts %j on %s", (message, field) => {
    expect(resetErrorField(message)).toBe(field);
  });

  it("leaves anything else for the form", () => {
    expect(resetErrorField("Something went wrong on our side. Please try again.")).toBeNull();
  });
});

describe("links", () => {
  it("goes to login with the notice after a reset", () => {
    expect(loginAfterResetHref(null)).toBe("/login?notice=password-reset");
  });

  it("keeps a safe next", () => {
    expect(loginAfterResetHref("/account/upload")).toBe("/login?notice=password-reset&next=%2Faccount%2Fupload");
    expect(forgotPasswordHref("/account/saved")).toBe("/forgot-password?next=%2Faccount%2Fsaved");
    expect(loginLinkHref("/photogram?q=red")).toBe("/login?next=%2Fphotogram%3Fq%3Dred");
  });

  it("swaps an unsafe next for the account page", () => {
    expect(loginAfterResetHref("https://evil.com")).toBe("/login?notice=password-reset&next=%2Faccount");
    expect(forgotPasswordHref("//evil.com")).toBe("/forgot-password?next=%2Faccount");
  });

  it("leaves next out when there wasn't one", () => {
    expect(forgotPasswordHref(null)).toBe("/forgot-password");
    expect(loginLinkHref(null)).toBe("/login");
  });
});

describe("loginNoticeText", () => {
  it("shows the password-updated message", () => {
    expect(loginNoticeText("password-reset")).toBe("Password updated. Log in with your new password.");
  });

  it("ignores unknown keys, so a link can't choose the words", () => {
    expect(loginNoticeText(null)).toBeNull();
    expect(loginNoticeText("")).toBeNull();
    expect(loginNoticeText("Your account is locked, call 555")).toBeNull();
    expect(loginNoticeText("toString")).toBeNull();
  });
});
