/**
 * Copies a form submission into the team's Google Sheet through /api/leads.
 * Best effort only: it never throws, so the form's own email step and UI are unaffected.
 * Call it as `void logLead(...)` after the email has been sent.
 */

import type { LeadFormName } from "@/app/api/leads/route";

export type LeadData = Record<string, string | number | boolean>;

export async function logLead(form: LeadFormName, data: LeadData, honeypot = ""): Promise<void> {
  try {
    const page = typeof window === "undefined" ? "" : window.location.pathname;
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form, data: { ...data, page }, website: honeypot }),
      // Lets the request finish even if the visitor leaves the page straight away.
      keepalive: true,
    });
  } catch {
    // The email already reached the team; a missing sheet row is not worth bothering the visitor about.
  }
}
