import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SavedView } from "@/components/buckets/SavedView";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Saved photos",
  alternates: { canonical: "/account/saved" },
  robots: { index: false },
};

export default function SavedPage() {
  if (!isPhotosApiEnabled) notFound();

  return (
    <>
      <PageHero title="Saved photos" subtitle="Your collections of looks and ideas, all in one place." />
      <section className="pb-24 sm:pb-32">
        <Container>
          <RequireAuth>
            <SavedView />
          </RequireAuth>
        </Container>
      </section>
    </>
  );
}
