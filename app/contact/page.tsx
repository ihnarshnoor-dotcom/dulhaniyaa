import type { Metadata } from "next";
import { Suspense } from "react";
import { business } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { EnquiryForm } from "@/components/contact/EnquiryForm";

export const metadata: Metadata = {
  title: "Contact Us & Get a Quote",
  description: `Send ${business.name} an enquiry for your wedding in Delhi NCR. Visit our studio in Rajouri Garden, West Delhi, call or WhatsApp us. We reply within 24 hours.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero title="Let's talk" subtitle="We reply within 24 hours." padding="pt-10 pb-6 sm:pt-14 sm:pb-8" />

      <section className="pb-24 sm:pb-32">
        <Container className="max-w-2xl">
          <Suspense fallback={<div className="min-h-200" />}>
            <EnquiryForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
