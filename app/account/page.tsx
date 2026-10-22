import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { AccountView } from "@/components/account/AccountView";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { isPhotosApiEnabled } from "@/lib/photosApi";

export const metadata: Metadata = {
  title: "My account",
  alternates: { canonical: "/account" },
  robots: { index: false },
};

export default function AccountPage() {
  if (!isPhotosApiEnabled) notFound();

  return (
    <>
      <PageHero title="My account" />
      <section className="pb-24 sm:pb-32">
        <Container>
          <RequireAuth>
            <AccountView />
          </RequireAuth>
        </Container>
      </section>
    </>
  );
}
