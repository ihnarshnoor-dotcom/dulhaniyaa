# Launch checklist

Everything below is placeholder content and **must** be replaced before the site goes live.
Almost all of it is in [`data/site.ts`](data/site.ts). Search that file for `REPLACE`.

## Business details (`data/site.ts` → `business`)
- [ ] Phone number: `phoneDisplay` **and** `phoneHref`
- [ ] WhatsApp number: `WHATSAPP_NUMBER` in Vercel (or `whatsappNumber`)
- [ ] Email address: `email`
- [ ] Studio address: `address` (line1, line2, postalCode)
- [ ] GST number: `gstNumber`
- [ ] Map location: `geo`, `mapEmbedUrl`, `mapLink`
- [ ] Instagram link and handle
- [ ] WedMeGood / WeddingWire profile links (leave `""` to hide)

## Photos
- [x] Hero photo (`images.hero`)
- [x] Service photos (`services[].image`)
- [x] Portfolio gallery (`gallery`)
- [ ] Featured weddings (`featuredWeddings`). Use real couples, with their permission.
- [ ] Team photos (`team[].photo`). Showing initials until added. Use real faces; this matters most for trust.
- [ ] Update the `alt` text for each photo to describe what's actually in it

## Content
- [ ] Team names and roles (`team`)
- [ ] Testimonial: a real quote and couple name, with permission (`testimonial`)
- [ ] Your story (`story`)
- [ ] Package prices and inclusions (`packages`)
- [ ] Featured wedding names, venues and dates

## Branding
- [ ] Logo: replace the text logo in `components/layout/Logo.tsx`
- [ ] Favicon: replace `app/icon.svg`
- [ ] Brand colours (optional): edit the `@theme` block in `app/globals.css`

## Technical
- [ ] Set `WEB3FORMS_ACCESS_KEY` in Vercel (used by the contact form and the budget calculator), restricted to your domain
- [ ] Set `SITE_URL` to the live domain, and `FACILITATOR_URL` and `BACKEND_URL` (see `.env.example`)
- [ ] Send a test enquiry on the live site and confirm the email arrives
- [ ] Tap the WhatsApp button on your phone and confirm it opens the right chat
- [ ] Submit `https://dulhaniyaa.com/sitemap.xml` in Google Search Console
- [ ] Create or claim your Google Business Profile with the same address and phone number
- [ ] Run Lighthouse (Chrome DevTools → Lighthouse → Mobile) on the live site
