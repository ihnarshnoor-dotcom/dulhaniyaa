import { Hero } from "@/components/home/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { FeaturedWeddings } from "@/components/home/FeaturedWeddings";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBanner } from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesPreview />
      <FeaturedWeddings />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
