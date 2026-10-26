import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CollectionSkeleton, CollectionView } from "@/components/buckets/CollectionView";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Collection",
  description: "A private collection of wedding looks on Dulhaniyaa.",
  robots: { index: false, follow: false },
};

/**
 * One collection, for its owner and the people they shared it with. Logged-out visitors go to
 * /login?next=/collections/<id> (RequireAuth) and come back here afterwards.
 */
export default function CollectionPage({ params }: PageProps<"/collections/[bucketId]">) {
  if (!isPhotosApiEnabled) notFound();

  return (
    <section className="pt-12 pb-24 sm:pt-16 sm:pb-32">
      <Container>
        <Suspense fallback={<CollectionSkeleton />}>
          {params.then(({ bucketId }) => (
            <RequireAuth>
              <CollectionView key={bucketId} bucketId={bucketId} />
            </RequireAuth>
          ))}
        </Suspense>
      </Container>
    </section>
  );
}
