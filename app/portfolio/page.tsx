import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { GalleryGrid } from "@/components/portfolio/GalleryGrid";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Portfolio: Mehendi, Haldi, Sangeet, Wedding & Reception",
  description:
    "See weddings we've planned, decorated and photographed across Delhi NCR, from mehendi and haldi to sangeet, pheras and receptions.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero title="Portfolio" />
      <section className="pb-24 sm:pb-32">
        <Container>
          <GalleryGrid />
        </Container>
      </section>
      <CtaBanner title="Love what you see?" />
    </>
  );
}
