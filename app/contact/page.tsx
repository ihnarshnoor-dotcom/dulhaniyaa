import type { Metadata } from "next";
import { Suspense } from "react";
import { business } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us & Get a Quote",
  description: `Send ${business.name} an enquiry for your wedding in Delhi NCR. Visit our studio in Rajouri Garden, West Delhi, call or WhatsApp us. We reply within 24 hours.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { address, social } = business;
  const details = [
    { label: "WhatsApp", value: "Chat with us", href: whatsappLink() },
    { label: "Phone", value: business.phoneDisplay, href: `tel:${business.phoneHref}` },
    { label: "Email", value: business.email, href: `mailto:${business.email}` },
    { label: "Instagram", value: social.instagramHandle, href: social.instagram },
    {
      label: "Studio",
      value: `${address.line1}, ${address.line2}, ${address.city} ${address.postalCode}`,
      href: business.mapLink,
    },
    { label: "Hours", value: business.hours },
  ];

  return (
    <>
      <PageHero title="Let's talk" subtitle="We reply within 24 hours." />

      <section className="pb-24 sm:pb-32">
        <Container className="grid gap-16 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
          <Suspense fallback={<div className="min-h-200" />}>
            <EnquiryForm />
          </Suspense>

          <ul className="space-y-6 text-sm">
            {details.map(({ label, value, href }) => (
              <li key={label}>
                <p className="text-xs tracking-wide text-muted">{label}</p>
                {href ? (
                  <a
                    href={href}
                    {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                    className="mt-1 block wrap-break-word transition-colors hover:text-primary"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="mt-1">{value}</p>
                )}
              </li>
            ))}
          </ul>
        </Container>

        <Container className="mt-20">
          <iframe
            src={business.mapEmbedUrl}
            title={`Map showing ${business.name} studio in ${address.line2}, ${address.city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-80 w-full border-0 grayscale sm:h-104"
          />
        </Container>
      </section>
    </>
  );
}
