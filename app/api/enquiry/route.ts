import { Resend } from "resend";
import { business } from "@/data/site";
import { enquirySchema, type Enquiry } from "@/lib/enquirySchema";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: Request) {
  // 1. Basic rate limit: 5 enquiries per 10 minutes per IP address
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many enquiries in a short time. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // 2. Honeypot: real people never fill the hidden "website" field.
  //    Pretend it worked so the bot doesn't retry.
  if (typeof body === "object" && body !== null && "website" in body && body.website) {
    return Response.json({ ok: true });
  }

  // 3. Validate with the same rules the form uses
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  const enquiry = parsed.data;

  // 4. Email the owner
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!apiKey || !ownerEmail) {
    console.warn("[enquiry] RESEND_API_KEY or OWNER_EMAIL missing. Enquiry not emailed:", enquiry);
    if (process.env.NODE_ENV === "production") {
      return Response.json({ error: "We couldn't send your enquiry right now." }, { status: 500 });
    }
    return Response.json({ ok: true }); // allow testing the form locally without keys
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || `${business.name} Website <onboarding@resend.dev>`,
    to: ownerEmail.split(",").map((e) => e.trim()),
    replyTo: enquiry.email || undefined,
    subject: `New wedding enquiry: ${enquiry.name} (${enquiry.eventDate})`,
    html: enquiryEmailHtml(enquiry),
    text: enquiryRows(enquiry)
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n"),
  });

  if (error) {
    console.error("[enquiry] Resend error:", error);
    return Response.json({ error: "We couldn't send your enquiry right now." }, { status: 502 });
  }

  // 5. Saving to a database (optional, for later)
  //    To keep a record in Supabase / Google Sheets, add the code here.
  //    The validated data is in `enquiry`.

  return Response.json({ ok: true });
}

function enquiryRows(e: Enquiry): [string, string][] {
  return [
    ["Name", e.name],
    ["Phone", e.phone],
    ["Email", e.email || "Not given"],
    ["Wedding date", e.eventDate],
    ["City", e.city],
    ["Budget", e.budget],
    ["Guests", e.guests],
    ["Services", e.services.join(", ")],
    ["Message", e.message || "None"],
  ];
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function enquiryEmailHtml(e: Enquiry) {
  const phoneDigits = e.phone.replace(/\D/g, "").slice(-10);
  const rows = enquiryRows(e)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;color:#6e5f58;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 12px;color:#2b1d1a">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:560px">
    <h2 style="color:#6b1e2e;margin:0 0 4px">New wedding enquiry</h2>
    <p style="color:#6e5f58;margin:0 0 16px">Sent from the ${business.name} website contact form.</p>
    <table style="border-collapse:collapse;width:100%;background:#fbf7f0;border-radius:8px">${rows}</table>
    <p style="margin-top:20px">
      <a href="tel:+91${phoneDigits}" style="color:#6b1e2e">Call ${escapeHtml(e.name)}</a> ·
      <a href="https://wa.me/91${phoneDigits}" style="color:#1f8f4e">WhatsApp ${escapeHtml(e.name)}</a>
    </p>
  </div>`;
}
