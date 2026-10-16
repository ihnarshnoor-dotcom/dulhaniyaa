/**
 * Sends the customer's details to the team's inbox with Web3Forms (https://web3forms.com).
 *
 * Web3Forms only accepts requests from the browser on its free plan, so this runs
 * client-side and the access key is public by design: it can only deliver to the
 * inbox it was created for. Lock it to your domain in the Web3Forms dashboard.
 */

const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

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

/** Thrown with "NETWORK" when Web3Forms can't be reached, "CONFIG" when the key is missing, else "SERVER". */
export class LeadError extends Error {}

export async function sendLeadEmail(lead: LeadEmail) {
  if (!ACCESS_KEY) throw new LeadError("CONFIG");
  console.log("[Lead] Sending details to the team", { name: lead.name, services: lead.services.length });

  let res: Response;
  try {
    res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `New budget plan lead: ${lead.name} (${lead.city})`,
        from_name: "Dulhaniyaa Budget Calculator",
        // Web3Forms uses "email" as the reply-to address.
        email: lead.email,
        Name: lead.name,
        Phone: lead.phone,
        Events: lead.events.join(", "),
        City: lead.city,
        Guests: lead.guestCount.toLocaleString("en-IN"),
        Budget: lead.budget || "Not decided",
        "Wedding month": lead.date || "Not decided",
        "Live estimate": lead.estimate,
        [`Services (${lead.services.length})`]: lead.services.join(", "),
      }),
    });
  } catch {
    console.error("[Lead] Failed: network");
    throw new LeadError("NETWORK");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    console.error("[Lead] Failed:", data?.message ?? res.status);
    throw new LeadError("SERVER");
  }
  console.log("[Lead] Sent");
}
