import { b2b } from "@/data/site";

/**
 * "What's this about?" on the contact form. Vendors pick their exact service; vendor pages
 * link to /contact?purpose=vendor:<slug> so it is already selected.
 */
export const purposeGroups = [
  {
    label: "Weddings",
    options: [
      { value: "wedding", label: "Planning my wedding" },
      { value: "package", label: "Asking about a package" },
    ],
  },
  {
    label: "Become a vendor partner",
    options: [
      ...b2b.services.map((s) => ({ value: `vendor:${s.slug}`, label: `Vendor partner: ${s.name}` })),
      { value: "vendor:other", label: "Vendor partner: several or other services" },
    ],
  },
  {
    label: "Other",
    options: [{ value: "other", label: "Something else" }],
  },
];

const allPurposes = purposeGroups.flatMap((g) => g.options);

export const DEFAULT_PURPOSE = "wedding";

export const isPurpose = (value: string) => allPurposes.some((p) => p.value === value);

export const purposeLabel = (value: string) => allPurposes.find((p) => p.value === value)?.label ?? value;

/** The purpose to pre-select from the page URL: ?purpose=…, else "package" when a package was picked. */
export function purposeFromParams(purpose: string | null, pickedPackage: string | null) {
  if (purpose && isPurpose(purpose)) return purpose;
  return pickedPackage ? "package" : DEFAULT_PURPOSE;
}

/** The service name for a vendor purpose ("vendor:decor" → "Décor"), or null for other purposes. */
export function vendorService(purpose: string) {
  if (!purpose.startsWith("vendor:")) return null;
  const slug = purpose.slice("vendor:".length);
  return b2b.services.find((s) => s.slug === slug)?.name ?? "Several or other services";
}

/** Email subject for an enquiry. Wedding enquiries keep the original wording. */
export function enquirySubject({ purpose, name, eventDate }: { purpose: string; name: string; eventDate: string }) {
  const service = vendorService(purpose);
  if (service) return `New vendor partnership enquiry: ${name} (${service})`;
  if (purpose === "package") return `New package enquiry: ${name} (${eventDate})`;
  if (purpose === "other") return `New enquiry: ${name}`;
  return `New wedding enquiry: ${name} (${eventDate})`;
}
