import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { UploadForm } from "@/components/account/UploadForm";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Upload a photo",
  alternates: { canonical: "/account/upload" },
  robots: { index: false },
};

export default function UploadPage() {
  if (!isPhotosApiEnabled) notFound();

  return (
    <>
      <PageHero title="Upload a photo" subtitle="Public photos appear on Photogram. Private ones are only visible to you." />
      <section className="pb-24 sm:pb-32">
        <Container className="max-w-2xl">
          <RequireAuth>
            <UploadForm />
          </RequireAuth>
        </Container>
      </section>
    </>
  );
}
