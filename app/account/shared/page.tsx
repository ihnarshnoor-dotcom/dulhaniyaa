import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SharedWithMe } from "@/components/buckets/SharedWithMe";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Shared with me",
  alternates: { canonical: "/account/shared" },
  robots: { index: false },
};

export default function SharedWithMePage() {
  if (!isPhotosApiEnabled) notFound();

  return (
    <>
      <PageHero title="Shared with me" />
      <section className="pb-24 sm:pb-32">
        <Container>
          <RequireAuth>
            <SharedWithMe />
          </RequireAuth>
        </Container>
      </section>
    </>
  );
}
