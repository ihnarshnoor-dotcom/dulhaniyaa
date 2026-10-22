import type { Metadata } from "next";
import { gallery } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { PhotoBento } from "@/components/photogram/PhotoBento";
import { CommunityPhotos } from "@/components/photogram/CommunityPhotos";

export const metadata: Metadata = {
  title: "Photogram: Our Favourite Wedding Moments",
  description: "Brides, grooms, haldi mornings and grand entrances: a gallery of moments from weddings we've planned and photographed.",
  alternates: { canonical: "/photogram" },
};

export default function PhotogramPage() {
  return (
    <section className="pt-16 pb-24 sm:pt-24 sm:pb-32">
      <Container>
        <div className="mb-12 text-center sm:mb-16">
          <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">Photogram</p>
          <h1 className="hero-fade mt-3 text-5xl leading-[1.05] [animation-delay:100ms] sm:text-7xl">Moments we love</h1>
          <p className="hero-fade mx-auto mt-5 max-w-md leading-relaxed text-muted [animation-delay:200ms]">
            {gallery.length} frames from haldi mornings, bridal portraits and grand entrances. Tap any photo to see it up close.
          </p>
        </div>
        <PhotoBento photos={gallery} />
        <CommunityPhotos />
      </Container>
    </section>
  );
}
