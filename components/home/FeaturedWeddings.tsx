import Image from "next/image";
import Link from "next/link";
import { featuredWeddings } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedWeddings() {
  return (
    <section className="pb-24 sm:pb-32">
      <Container>
        <SectionHeading title="Recent weddings" />
        <Reveal stagger className="grid gap-6 md:grid-cols-3">
          {featuredWeddings.map((w) => (
            <Link key={w.couple} href="/portfolio" className="group">
              <div className="relative aspect-3/2 overflow-hidden rounded-3xl">
                <Image
                  src={w.image.src}
                  alt={w.image.alt}
                  fill
                  placeholder={w.image.blurDataURL ? "blur" : "empty"}
                  blurDataURL={w.image.blurDataURL}
                  style={{ objectPosition: w.image.position }}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-4 font-serif text-2xl transition-colors group-hover:text-primary">{w.couple}</p>
            </Link>
          ))}
        </Reveal>
        <div className="mt-14 text-center">
          <Link href="/portfolio" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            View portfolio →
          </Link>
        </div>
      </Container>
    </section>
  );
}
