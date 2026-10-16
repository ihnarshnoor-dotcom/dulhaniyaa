import Image from "next/image";
import Link from "next/link";
import { services } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ServicesPreview() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading title="What we do" />
        <Reveal stagger className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Link key={s.slug} href={`/services#${s.slug}`} className="group">
              <div className="relative aspect-3/2 overflow-hidden rounded-3xl">
                <Image
                  src={s.image.src}
                  alt={s.image.alt}
                  fill
                  placeholder={s.image.blurDataURL ? "blur" : "empty"}
                  blurDataURL={s.image.blurDataURL}
                  style={{ objectPosition: s.image.position }}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-5 text-2xl transition-colors group-hover:text-primary">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.short}</p>
            </Link>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
