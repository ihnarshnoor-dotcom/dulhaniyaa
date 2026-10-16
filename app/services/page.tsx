import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Wedding Services: Planning, Decor, Photography & Bridal Wear",
  description:
    "Wedding planning, decor and design, candid photography and films, and bridal couture, all from one trusted team in West Delhi serving Delhi NCR.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero title="Services" subtitle="Book us for everything, or just what you need." />

      <div className="space-y-20 pb-24 sm:space-y-32 sm:pb-32">
        {services.map((s, i) => (
          <section key={s.slug} id={s.slug} className="scroll-mt-24">
            <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <Reveal className={i % 2 === 1 ? "lg:order-last" : ""}>
                <div className="relative aspect-3/2 overflow-hidden rounded-3xl shadow-xl shadow-primary/10">
                  <Image
                    src={s.image.src}
                    alt={s.image.alt}
                    fill
                    placeholder={s.image.blurDataURL ? "blur" : "empty"}
                    blurDataURL={s.image.blurDataURL}
                    style={{ objectPosition: s.image.position }}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>

              <Reveal>
                <p className="text-sm text-muted">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-2 text-4xl sm:text-5xl">{s.title}</h2>
                <p className="mt-4 max-w-md leading-relaxed text-muted">{s.short}</p>
                <Link
                  href="/contact"
                  className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Enquire →
                </Link>
              </Reveal>
            </Container>
          </section>
        ))}
      </div>

      <CtaBanner />
    </>
  );
}
