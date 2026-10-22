import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Suspense } from "react";
import { business, images, services } from "@/data/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const description = `${business.name} plans, decorates, photographs and dresses weddings across Delhi NCR from our studio in West Delhi. Mehendi, haldi, sangeet, wedding and reception, all with one trusted team.`;

export const metadata: Metadata = {
  metadataBase: new URL(business.url),
  title: {
    default: `${business.name} | Wedding Planners, Decor & Photography in West Delhi`,
    template: `%s | ${business.name}`,
  },
  description,
  keywords: [
    "wedding planner Delhi",
    "wedding planner West Delhi",
    "wedding decorator Delhi NCR",
    "wedding photographer Delhi",
    "bridal lehenga West Delhi",
    "mehendi haldi sangeet decor",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: business.name,
    title: `${business.name}: ${business.tagline}`,
    description,
    url: "/",
    images: [{ url: images.hero.src, width: images.hero.width, height: images.hero.height, alt: images.hero.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${business.name}: ${business.tagline}`,
    description,
    images: [images.hero.src],
  },
};

export const viewport: Viewport = {
  themeColor: "#fef9f3",
};

// Structured data so Google understands who we are and where we work.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${business.url}/#business`,
  name: business.name,
  description,
  url: business.url,
  image: images.hero.src,
  telephone: business.phoneHref,
  email: business.email,
  priceRange: "₹₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${business.address.line1}, ${business.address.line2}`,
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    postalCode: business.address.postalCode,
    addressCountry: business.address.country,
  },
  geo: { "@type": "GeoCoordinates", ...business.geo },
  areaServed: business.areaServed.map((name) => ({ "@type": "City", name })),
  openingHours: "Mo-Su 10:00-20:00",
  sameAs: [business.social.instagram, business.social.wedMeGood, business.social.weddingWire].filter(Boolean),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Wedding services",
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.title, description: s.short },
    })),
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${inter.variable} antialiased`}>
      <body className="flex min-h-svh flex-col font-sans">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <AuthProvider>
          {/* The header reads the current path. On routes whose path is only known per request
              (like /s/[token] share links) that has to wait, which needs a Suspense boundary or
              the build fails. Every other page still renders the header straight into its HTML. */}
          <Suspense fallback={<div aria-hidden className="h-18 border-b border-transparent sm:h-20" />}>
            <Header />
          </Suspense>
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <WhatsAppFloat />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
