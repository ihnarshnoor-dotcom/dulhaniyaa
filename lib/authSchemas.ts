import { z } from "zod";

/** Removes spaces, dashes and brackets: "+91 (98100) 000-00" becomes "+919810000000". */
export const normalizePhone = (value: string) => value.replace(/[\s\-()]/g, "");

// Same rule as the photos API: 10 to 15 digits with an optional leading +.
const phonePattern = /^\+?\d{10,15}$/;

const email = z.string().trim().min(1, "Enter your email address").pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(80, "Please keep your name under 80 characters"),
    email,
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || phonePattern.test(normalizePhone(v)), "Enter 10 to 15 digits, optionally starting with +, or leave it blank"),
    password: z.string().min(8, "Use at least 8 characters").max(128, "Please keep it under 128 characters"),
    confirmPassword: z.string().min(1, "Please type your password again"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "The passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;
