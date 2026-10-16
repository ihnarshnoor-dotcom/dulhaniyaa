import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Testimonials",
  alternates: { canonical: "/testimonials" },
};

export default function TestimonialsPage() {
  return <ComingSoon title="Testimonials" text="Love notes from our couples and their families. This page is on its way." />;
}
