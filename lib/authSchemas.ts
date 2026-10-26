import { z } from "zod";

/** Removes spaces, dashes and brackets: "+91 (98100) 000-00" becomes "+919810000000". */
export const normalizePhone = (value: string) => value.replace(/[\s\-()]/g, "");

// Same rule as the photos API: 10 to 15 digits with an optional leading +.
const phonePattern = /^\+?\d{10,15}$/;

/** An email field. `required` is the message for an empty one (someone else's email needs other words). */
export const emailField = (required = "Enter your email address") =>
  z.string().trim().min(1, required).pipe(z.email("Enter a valid email address"));

const email = emailField();

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Length in UTF-8 bytes, the way the server counts it: "é" is 2 bytes and most emoji are 4. */
export const utf8Bytes = (value: string) => new TextEncoder().encode(value).length;

// bcrypt only reads the first 72 bytes, so the API refuses longer passwords.
export const MAX_PASSWORD_BYTES = 72;

/** A new password, for signing up and for resetting one. Same limits as the photos API. */
export const newPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .refine((v) => utf8Bytes(v) <= MAX_PASSWORD_BYTES, "That's too long. Use at most 72 bytes (emoji and accented letters count as more than one)");

const confirmPassword = z.string().min(1, "Please type your password again");

const passwordsMatch = (v: { password: string; confirmPassword: string }) => v.password === v.confirmPassword;
const matchError = { message: "The passwords don't match", path: ["confirmPassword"] };

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(80, "Please keep your name under 80 characters"),
    email,
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || phonePattern.test(normalizePhone(v)), "Enter 10 to 15 digits, optionally starting with +, or leave it blank"),
    password: newPassword,
    confirmPassword,
  })
  .refine(passwordsMatch, matchError);

export type RegisterValues = z.infer<typeof registerSchema>;

/* ───────────── Forgot password ───────────── */

export const RESET_CODE_LENGTH = 6;

export const forgotPasswordSchema = z.object({ email });

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/** The emailed code stays a string, so "042713" keeps its leading zero. */
export const resetCodeField = z
  .string()
  .trim()
  .min(1, "Enter the code from the email")
  .regex(new RegExp(`^\\d{${RESET_CODE_LENGTH}}$`), `The code must be ${RESET_CODE_LENGTH} digits`);

/** Step 2. The email comes from step 1 and is checked again when the form is sent. */
export const resetPasswordSchema = z
  .object({
    code: resetCodeField,
    password: newPassword,
    confirmPassword,
  })
  .refine(passwordsMatch, matchError);

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
