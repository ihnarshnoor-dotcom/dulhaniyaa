import { z } from "zod";
import { budgetRanges, guestRanges, services } from "@/data/site";

export const serviceOptions = services.map((s) => s.title);

// Accepts 98100 00000, 9810000000, +91 98100 00000, 09810000000
export const indianMobile = /^(?:\+?91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/;

function isTodayOrLater(value: string) {
  const picked = new Date(`${value}T23:59:59`);
  return !Number.isNaN(picked.getTime()) && picked.getTime() >= Date.now() - 86_400_000;
}

/** Shared by the form (browser) and the API route (server). */
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(indianMobile, "Enter a valid 10-digit Indian mobile number"),
  email: z.union([z.literal(""), z.email("Enter a valid email or leave it blank")]),
  eventDate: z
    .string()
    .min(1, "Please pick your wedding date")
    .refine(isTodayOrLater, "The date can't be in the past"),
  city: z.string().trim().min(2, "Which city is the wedding in?").max(60),
  budget: z
    .string()
    .refine((v) => budgetRanges.includes(v), "Please choose a budget range"),
  guests: z
    .string()
    .refine((v) => guestRanges.includes(v), "Please choose a guest count"),
  services: z
    .array(z.string())
    .min(1, "Pick at least one service")
    .refine((list) => list.every((s) => serviceOptions.includes(s)), "Invalid service"),
  message: z.string().trim().max(1000, "Please keep it under 1000 characters"),
  // Honeypot: hidden from people, bots fill it in. Must stay empty.
  website: z.string().max(0).optional(),
});

export type Enquiry = z.infer<typeof enquirySchema>;

/** Summary used for the WhatsApp fallback message. */
export function enquiryToWhatsApp(e: Enquiry) {
  return [
    `Hi Dulhaniyaa! I just sent an enquiry on your website.`,
    `Name: ${e.name}`,
    `Wedding date: ${e.eventDate}`,
    `City: ${e.city}`,
    `Guests: ${e.guests}`,
    `Budget: ${e.budget}`,
    `Services: ${e.services.join(", ")}`,
  ].join("\n");
}
