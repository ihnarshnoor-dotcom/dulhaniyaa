import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { FormPlaceholder } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Create an account",
  alternates: { canonical: "/register" },
  robots: { index: false },
};

export default function RegisterPage() {
  if (!isPhotosApiEnabled) notFound();

  return (
    <>
      <PageHero title="Create your account" subtitle="Share your wedding looks on Photogram and keep your uploads in one place." />
      <section className="pb-24 sm:pb-32">
        <Container className="max-w-md">
          <Suspense fallback={<FormPlaceholder />}>
            <RegisterForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
