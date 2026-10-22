/**
 * Sends the site's forms to the team's inbox with Web3Forms (https://web3forms.com):
 * the budget calculator's leads and the contact form's enquiries.
 *
 * Web3Forms only accepts requests from the browser on its free plan, so this runs
 * client-side and the access key is public by design: it can only deliver to the
 * inbox it was created for. Lock it to your domain in the Web3Forms dashboard.
 */

const ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;

/** Thrown with "NETWORK" when Web3Forms can't be reached, "CONFIG" when the key is missing, else "SERVER". */
export class LeadError extends Error {}

type Submission = {
  subject: string;
  fromName: string;
  /** Reply-to address, if the visitor gave one. */
  replyTo?: string;
  /** Labelled rows shown in the email, in order. */
  fields: Record<string, string>;
  /** Hidden honeypot value; Web3Forms drops the submission when it is filled. */
  botcheck?: string;
};

async function submit({ subject, fromName, replyTo, fields, botcheck = "" }: Submission, logTag: string) {
  if (!ACCESS_KEY) throw new LeadError("CONFIG");

  let res: Response;
  try {
    res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject,
        from_name: fromName,
        // Web3Forms uses "email" as the reply-to address.
        ...(replyTo && { email: replyTo }),
        botcheck,
        ...fields,
      }),
    });
  } catch {
    console.error(`[${logTag}] Failed: network`);
    throw new LeadError("NETWORK");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    console.error(`[${logTag}] Failed:`, data?.message ?? res.status);
    throw new LeadError("SERVER");
  }
}

/* ───────────── Budget calculator leads ───────────── */

export type LeadEmail = {
  name: string;
  phone: string;
  email: string;
  events: string[];
  city: string;
  guestCount: number;
  budget?: string;
  date?: string;
  services: string[];
  estimate: string;
};

export async function sendLeadEmail(lead: LeadEmail) {
  console.log("[Lead] Sending details to the team", { name: lead.name, services: lead.services.length });
  await submit(
    {
      subject: `New budget plan lead: ${lead.name} (${lead.city})`,
      fromName: "Dulhaniyaa Budget Calculator",
      replyTo: lead.email,
      fields: {
        Name: lead.name,
        Phone: lead.phone,
        Events: lead.events.join(", "),
        City: lead.city,
        Guests: lead.guestCount.toLocaleString("en-IN"),
        Budget: lead.budget || "Not decided",
        "Wedding month": lead.date || "Not decided",
        "Live estimate": lead.estimate,
        [`Services (${lead.services.length})`]: lead.services.join(", "),
      },
    },
    "Lead",
  );
  console.log("[Lead] Sent");
}

/* ───────────── Contact form enquiries ───────────── */

export type EnquiryEmail = {
  subject: string;
  replyTo?: string;
  fields: Record<string, string>;
  botcheck?: string;
};

export const sendEnquiryEmail = (enquiry: EnquiryEmail) =>
  submit({ ...enquiry, fromName: "Dulhaniyaa Website" }, "Enquiry");
