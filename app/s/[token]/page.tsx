import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { SharedLink, SharedLinkSkeleton } from "@/components/share/SharedLink";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Shared with you",
  description: "Wedding photos shared from Dulhaniyaa's Photogram.",
  // Share links are private-ish and can be switched off, so keep them out of search results.
  robots: { index: false, follow: false },
};

/** Where a photo share link (and its QR code) lands. No login needed: the token is the permission. */
export default function SharedLinkPage({ params }: PageProps<"/s/[token]">) {
  if (!isPhotosApiEnabled) notFound();

  return (
    <section className="pt-12 pb-24 sm:pt-16 sm:pb-32">
      <Container>
        <Suspense fallback={<SharedLinkSkeleton />}>{params.then(({ token }) => <SharedLink token={token} />)}</Suspense>
      </Container>
    </section>
  );
}
