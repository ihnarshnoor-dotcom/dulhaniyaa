import Image from "next/image";
import { business, images } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section className="pt-16 sm:pt-24">
      <Container className="text-center">
        <h1 className="hero-fade mx-auto max-w-3xl text-5xl leading-[1.05] sm:text-7xl">
          {business.tagline}
        </h1>
        <p className="hero-fade mx-auto mt-6 max-w-md leading-relaxed text-muted [animation-delay:150ms]">
          Planning, decor, photography and bridal couture, from one team in West Delhi.
        </p>
        <div className="hero-fade mt-10 flex flex-col justify-center gap-3 [animation-delay:300ms] sm:flex-row">
          <Button href="/contact">Get a Quote</Button>
          <Button href={whatsappLink()} variant="secondary">
            Chat on WhatsApp
          </Button>
        </div>
      </Container>

      {/* REPLACE: to use a looping video instead, swap <Image> for
          <video autoPlay muted loop playsInline poster="/images/hero.webp" className="absolute inset-0 size-full object-cover"><source src="/videos/hero.mp4" type="video/mp4" /></video> */}
      <Container className="hero-fade mt-16 [animation-delay:450ms] sm:mt-20">
        <div className="relative aspect-4/3 overflow-hidden rounded-4xl shadow-2xl shadow-primary/10 sm:aspect-video">
          <Image
            src={images.hero.src}
            alt={images.hero.alt}
            fill
            preload
            placeholder={images.hero.blurDataURL ? "blur" : "empty"}
            blurDataURL={images.hero.blurDataURL}
            sizes="(min-width: 1152px) 1104px, 100vw"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
