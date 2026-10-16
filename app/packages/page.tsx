import type { Metadata } from "next";
import Link from "next/link";
import { packages, packagesNote } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Wedding Packages & Pricing",
  description:
    "Transparent wedding packages starting from ₹4,00,000. Planning, decor, photography and bridal styling for weddings across Delhi NCR.",
  alternates: { canonical: "/packages" },
};

export default function PackagesPage() {
  return (
    <>
      <PageHero title="Packages" subtitle="Three starting points. Every package can be tailored." />

      <section className="pb-24 sm:pb-32">
        <Container>
          <Reveal stagger className="grid gap-6 lg:grid-cols-3">
            {packages.map((p) => (
              <article
                key={p.name}
                className={`flex flex-col border p-8 sm:p-10 ${p.popular ? "border-primary" : "border-ink/10"}`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-3xl">{p.name}</h2>
                  {p.popular && <span className="text-xs tracking-wide text-primary">Most loved</span>}
                </div>
                <p className="mt-1 text-sm text-muted">{p.idealFor}</p>

                <p className="mt-8 font-serif text-4xl">{p.price}</p>
                <p className="text-xs text-muted">starting from</p>

                <ul className="mt-8 flex-1 space-y-3 border-t border-ink/10 pt-8 text-sm text-muted">
                  {p.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <Link
                  href={`/contact?package=${encodeURIComponent(p.name)}`}
                  className={buttonClasses(p.popular ? "primary" : "secondary", "mt-10 w-full")}
                >
                  Enquire
                </Link>
              </article>
            ))}
          </Reveal>

          <p className="mx-auto mt-12 max-w-xl text-center text-sm leading-relaxed text-muted">
            {packagesNote}{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              Ask for a custom quote
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
