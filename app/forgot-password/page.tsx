import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { FormPlaceholder } from "@/components/auth/LoginForm";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Reset your password",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  if (!isPhotosApiEnabled) notFound();

  return (
    <>
      <PageHero title="Forgot your password?" subtitle="We'll email you a code to set a new one." />
      <section className="pb-24 sm:pb-32">
        <Container className="max-w-md">
          <Suspense fallback={<FormPlaceholder />}>
            <ForgotPasswordForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
