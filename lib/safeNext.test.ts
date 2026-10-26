import { describe, expect, it } from "vitest";
import { loginHref, safeNextPath } from "./safeNext";

describe("safeNextPath", () => {
  it("keeps internal paths, including query and hash", () => {
    expect(safeNextPath("/account")).toBe("/account");
    expect(safeNextPath("/account/upload")).toBe("/account/upload");
    expect(safeNextPath("/photogram?page=2#top")).toBe("/photogram?page=2#top");
  });

  it("falls back when missing or empty", () => {
    expect(safeNextPath(null)).toBe("/account");
    expect(safeNextPath(undefined)).toBe("/account");
    expect(safeNextPath("")).toBe("/account");
    expect(safeNextPath(null, "/")).toBe("/");
  });

  it.each([
    "https://evil.com",
    "http://evil.com/account",
    "//evil.com",
    "///evil.com",
    "/\\evil.com",
    "\\\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "javascript:alert(1)",
    "account",
    " /account",
  ])("rejects %j", (value) => {
    expect(safeNextPath(value)).toBe("/account");
  });

  it("never sends people back to the login or sign-up page", () => {
    expect(safeNextPath("/login")).toBe("/account");
    expect(safeNextPath("/login?next=/account")).toBe("/account");
    expect(safeNextPath("/register")).toBe("/account");
    expect(safeNextPath("/forgot-password")).toBe("/account");
    expect(safeNextPath("/loginhelp")).toBe("/loginhelp");
  });

  it("builds an encoded login link", () => {
    expect(loginHref("/account/upload")).toBe("/login?next=%2Faccount%2Fupload");
  });
});
