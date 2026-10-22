import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { FormPlaceholder, LoginForm } from "@/components/auth/LoginForm";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "Log in",
  alternates: { canonical: "/login" },
  robots: { index: false },
};

export default function LoginPage() {
  if (!isPhotosApiEnabled) notFound();

  return (
    <>
      <PageHero title="Welcome back" subtitle="Log in to share photos and manage your uploads." />
      <section className="pb-24 sm:pb-32">
        <Container className="max-w-md">
          <Suspense fallback={<FormPlaceholder />}>
            <LoginForm />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
