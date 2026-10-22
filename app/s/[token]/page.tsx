import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { SharedPhoto, SharedPhotoSkeleton } from "@/components/share/SharedPhoto";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "A photo shared with you",
  description: "A wedding photo shared from Dulhaniyaa's Photogram.",
  // Share links are private-ish and expire, so keep them out of search results.
  robots: { index: false, follow: false },
};

/** Where a share link (and its QR code) lands. No login needed: the token is the permission. */
export default function SharedPhotoPage({ params }: PageProps<"/s/[token]">) {
  if (!isPhotosApiEnabled) notFound();

  return (
    <section className="pt-12 pb-24 sm:pt-16 sm:pb-32">
      <Container>
        <Suspense fallback={<SharedPhotoSkeleton />}>{params.then(({ token }) => <SharedPhoto token={token} />)}</Suspense>
      </Container>
    </section>
  );
}
