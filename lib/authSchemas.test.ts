import { describe, expect, it } from "vitest";
import { loginSchema, normalizePhone, registerSchema } from "./authSchemas";

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
