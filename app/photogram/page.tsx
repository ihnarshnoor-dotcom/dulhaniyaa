import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { business, gallery } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { ABOVE_THE_FOLD, PhotoBento } from "@/components/photogram/PhotoBento";
import { PhotogramPhotos } from "@/components/photogram/PhotogramPhotos";
import { photogramView } from "@/lib/photogramFallback";
import { fetchFirstPhotogramPage } from "@/lib/photogramServer";
import { imageAlt } from "@/lib/photosApi";

const title = "Photogram: Our Favourite Wedding Moments";
const description =
  "Brides, grooms, haldi mornings and grand entrances: a gallery of moments from weddings we've planned and photographed.";

/**
 * The first page of Photogram photos, fetched on the server so they are in the HTML. Kept for
 * 5 minutes (the backend also caches public photo files for 5 minutes), then refreshed in the
 * background. A failure or an empty feed is retried after a minute instead.
 */
async function getFirstPage() {
  "use cache";
  const page = await fetchFirstPhotogramPage();
  if (photogramView(page) === "feed") cacheLife({ stale: 300, revalidate: 300, expire: 3600 });
  else cacheLife("minutes");
  return page;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFirstPage();
  const first = page?.photos[0];
  // TEMP fallback until photogram photos are imported - delete after import: the gallery image here.
  const image = first
    ? { url: first.url, alt: imageAlt(first) || title }
    : { url: gallery[0].src, width: gallery[0].width, height: gallery[0].height, alt: gallery[0].alt };
  return {
    title,
    description,
    alternates: { canonical: "/photogram" },
    // Replaces the layout's openGraph and twitter as a whole, so the shared fields are repeated here.
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: business.name,
      title: `${title} | ${business.name}`,
      description,
      url: "/photogram",
      images: [image],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${business.name}`, description, images: [image.url] },
  };
}

export default async function PhotogramPage() {
  const firstPage = await getFirstPage();

  return (
    <section className="pt-16 pb-24 sm:pt-24 sm:pb-32">
      <Container>
        <div className="mb-12 text-center sm:mb-16">
          <p className="hero-fade text-xs font-medium tracking-[0.25em] text-primary uppercase">Photogram</p>
          <h1 className="hero-fade mt-3 text-5xl leading-[1.05] [animation-delay:100ms] sm:text-7xl">Moments we love</h1>
          <p className="hero-fade mx-auto mt-5 max-w-md leading-relaxed text-muted [animation-delay:200ms]">
            Frames from haldi mornings, bridal portraits and grand entrances. Tap any photo to see it up close.
          </p>
        </div>
        {/* TEMP fallback until photogram photos are imported - delete after import: the PhotoBento branch,
            the gallery/PhotoBento imports here and the gallery image in generateMetadata. Keep `gallery`
            itself: the home page and portfolio use it. */}
        {firstPage && photogramView(firstPage) === "feed" ? (
          <PhotogramPhotos initial={firstPage} />
        ) : (
          <PhotoBento photos={gallery} eager={ABOVE_THE_FOLD} />
        )}
      </Container>
    </section>
  );
}
