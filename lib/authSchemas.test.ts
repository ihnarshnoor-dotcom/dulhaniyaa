import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  MAX_PASSWORD_BYTES,
  newPassword,
  normalizePhone,
  registerSchema,
  resetCodeField,
  resetPasswordSchema,
  utf8Bytes,
} from "./authSchemas";

const validRegister = {
  name: "Anaya Sharma",
  email: "anaya@example.com",
  phone: "",
  password: "password123",
  confirmPassword: "password123",
};

const issuePaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((i) => i.path.join(".")) ?? [];

describe("loginSchema", () => {
  it("accepts an email and password", () => {
    expect(loginSchema.safeParse({ email: "priya@example.com", password: "x" }).success).toBe(true);
  });

  it("trims the email", () => {
    expect(loginSchema.parse({ email: "  priya@example.com ", password: "x" }).email).toBe("priya@example.com");
  });

  it("rejects a bad email and an empty password", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "" });
    expect(issuePaths(result).sort()).toEqual(["email", "password"]);
  });
});

describe("registerSchema", () => {
  it("accepts valid details with no phone", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it.each(["+91 (98765) 432-10", "9876543210", "+447911123456", "0098 7654 3210 12"])("accepts phone %j", (phone) => {
    expect(registerSchema.safeParse({ ...validRegister, phone }).success).toBe(true);
  });

  it.each(["12-34", "98765", "+91 98765 4321O", "1234567890123456", "++919876543210"])("rejects phone %j", (phone) => {
    expect(issuePaths(registerSchema.safeParse({ ...validRegister, phone }))).toEqual(["phone"]);
  });

  it("requires at least 8 characters in the password", () => {
    const result = registerSchema.safeParse({ ...validRegister, password: "short", confirmPassword: "short" });
    expect(issuePaths(result)).toEqual(["password"]);
  });

  it("requires the passwords to match", () => {
    const result = registerSchema.safeParse({ ...validRegister, confirmPassword: "password124" });
    expect(issuePaths(result)).toEqual(["confirmPassword"]);
  });

  it("requires a name and a valid email", () => {
    const result = registerSchema.safeParse({ ...validRegister, name: " ", email: "anaya@" });
    expect(issuePaths(result).sort()).toEqual(["email", "name"]);
  });
});

describe("normalizePhone", () => {
  it("strips spaces, dashes and brackets", () => {
    expect(normalizePhone("+91 (98765) 432-10")).toBe("+919876543210");
  });
});

describe("utf8Bytes", () => {
  it("counts bytes, not characters", () => {
    expect(utf8Bytes("abc")).toBe(3);
    expect(utf8Bytes("é")).toBe(2);
    expect(utf8Bytes("😀")).toBe(4);
    expect("😀".length).toBe(2);
  });
});

describe("newPassword", () => {
  it("needs at least 8 characters", () => {
    expect(newPassword.safeParse("1234567").success).toBe(false);
    expect(newPassword.safeParse("12345678").success).toBe(true);
  });

  it("allows exactly 72 bytes and refuses 73", () => {
    expect(MAX_PASSWORD_BYTES).toBe(72);
    expect(newPassword.safeParse("a".repeat(72)).success).toBe(true);
    expect(newPassword.safeParse("a".repeat(73)).success).toBe(false);
  });

  it("counts emoji as 4 bytes at the 72-byte edge", () => {
    // 18 emoji = 72 bytes but only 36 UTF-16 characters: string length alone would let 19 through.
    expect(newPassword.safeParse("😀".repeat(18)).success).toBe(true);
    expect(newPassword.safeParse("😀".repeat(18) + "a").success).toBe(false);
    expect(newPassword.safeParse("😀".repeat(19)).success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts and trims a valid email", () => {
    expect(forgotPasswordSchema.parse({ email: " anaya@example.com " }).email).toBe("anaya@example.com");
  });

  it.each(["", "anaya", "anaya@", "@example.com"])("rejects %j", (email) => {
    expect(issuePaths(forgotPasswordSchema.safeParse({ email }))).toEqual(["email"]);
  });
});

describe("resetCodeField", () => {
  it("keeps the leading zero as a string", () => {
    expect(resetCodeField.parse("042713")).toBe("042713");
    expect(resetCodeField.parse("000000")).toBe("000000");
  });

  it.each(["", "12345", "1234567", "12a456", "12 456", "-12345", "1.2345"])("rejects %j", (code) => {
    expect(resetCodeField.safeParse(code).success).toBe(false);
  });

  it("explains a code of the wrong length", () => {
    expect(resetCodeField.safeParse("12345").error?.issues[0].message).toBe("The code must be 6 digits");
  });
});

describe("resetPasswordSchema", () => {
  const valid = { code: "042713", password: "new password", confirmPassword: "new password" };

  it("accepts a code and matching passwords", () => {
    expect(resetPasswordSchema.parse(valid)).toEqual(valid);
  });

  it("requires the passwords to match", () => {
    expect(issuePaths(resetPasswordSchema.safeParse({ ...valid, confirmPassword: "new passwore" }))).toEqual(["confirmPassword"]);
  });

  it("checks the code and password length", () => {
    const result = resetPasswordSchema.safeParse({ code: "4271", password: "short", confirmPassword: "short" });
    expect(issuePaths(result).sort()).toEqual(["code", "password"]);
  });
});
