import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CommunityPhotos } from "@/components/photogram/CommunityPhotos";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Community: Photos From Our Brides",
  description:
    "Looks, details and moments shared by our brides and their families. Search by event or style, save favourites and share your own.",
  alternates: { canonical: "/community" },
};

export default function CommunityPage() {
  return (
    <section className="pt-16 pb-24 sm:pt-24 sm:pb-32">
      <Container>
        <div className="mb-12 text-center sm:mb-16">
          <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">Community</p>
          <h1 className="hero-fade mt-3 text-5xl leading-[1.05] [animation-delay:100ms] sm:text-7xl">From our community</h1>
          <p className="hero-fade mx-auto mt-5 max-w-md leading-relaxed text-muted [animation-delay:200ms]">
            Looks, details and moments shared by our brides and their families.
          </p>
          <Link
            href="/account/upload"
            className="hero-fade mt-5 inline-block text-sm font-medium text-primary underline underline-offset-4 [animation-delay:300ms]"
          >
            Upload your photo
          </Link>
        </div>
        {isPhotosApiEnabled ? (
          <CommunityPhotos />
        ) : (
          <p className="text-center text-muted">Community photos are coming soon.</p>
        )}
      </Container>
    </section>
  );
}
