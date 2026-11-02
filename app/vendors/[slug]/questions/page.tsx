import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { b2b } from "@/data/site";
import { vendorQuestions } from "@/data/vendorQuestions";
import { Container } from "@/components/ui/Container";
import { VendorQna } from "@/components/vendors/VendorQna";

// One Q&A per service that has questions, all built at build time. Any other slug shows the 404 page.
export function generateStaticParams() {
  return b2b.services.filter((s) => vendorQuestions[s.slug]).map((s) => ({ slug: s.slug }));
}

function find(slug: string) {
  const service = b2b.services.find((s) => s.slug === slug);
  const questions = vendorQuestions[slug];
  return service && questions ? { service, questions } : null;
}

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]/questions">): Promise<Metadata> {
  const found = find((await params).slug);
  if (!found) return {};
  return {
    title: `Find your ${found.service.name} match`,
    description: `Tap through a few quick questions and tell us what you want from your ${found.service.name.toLowerCase()} partner.`,
    alternates: { canonical: `/vendors/${found.service.slug}/questions` },
    robots: { index: false },
  };
}

export default function VendorQuestionsPage({ params }: PageProps<"/vendors/[slug]/questions">) {
  return (
    <Suspense fallback={<div aria-busy="true" aria-label="Loading" className="shimmer mx-auto my-24 h-96 max-w-3xl rounded-4xl" />}>
      <QuestionsContent params={params} />
    </Suspense>
  );
}

async function QuestionsContent({ params }: Pick<PageProps<"/vendors/[slug]/questions">, "params">) {
  const found = find((await params).slug);
  if (!found) notFound();
  const { service, questions } = found;
  const ServiceIcon = questions.icon;

  return (
    <div className="relative isolate overflow-hidden">
      {/* Soft, blurred photo of the service behind the flow */}
      <div className="absolute inset-x-0 top-0 -z-10 h-136" aria-hidden>
        <Image src={service.image.src} alt="" fill priority sizes="100vw" className="scale-110 object-cover blur-2xl" />
        <div className="absolute inset-0 bg-linear-to-b from-ivory/40 via-ivory/70 to-ivory" />
      </div>

      <Container className="max-w-3xl pt-12 pb-24 sm:pt-16 sm:pb-32">
        <div className="mb-8 text-center">
          <h1 className="hero-fade flex items-center justify-center gap-3 text-4xl leading-tight sm:text-5xl">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary text-primary sm:size-12" aria-hidden>
              <ServiceIcon className="size-5 sm:size-6" strokeWidth={1.6} />
            </span>
            {service.name}
          </h1>
          <p className="hero-fade mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted [animation-delay:100ms]">
            {questions.intro}
          </p>
        </div>

        <VendorQna slug={service.slug} serviceName={service.name} />
      </Container>
    </div>
  );
}
