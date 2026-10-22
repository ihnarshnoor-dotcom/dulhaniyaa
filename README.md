# Dulhaniyaa: wedding website

Website for **Dulhaniyaa**, a wedding planning, decor, photography and bridal couture studio in West Delhi.
Its one job is to get visitors to send an enquiry, through the form or on WhatsApp.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and GSAP. Ready to deploy on Vercel.

> Before launch, work through **[LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)**. Every photo, phone number,
> GST number and testimonial on the site is currently a placeholder.

---

## 1. Run it on your computer

You need [Node.js](https://nodejs.org) 20.9 or newer.

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run dev
```

Open http://localhost:3000.

Use a single settings file, `.env.local` (delete any old `.env`). Without `WEB3FORMS_ACCESS_KEY`
the contact form and the budget calculator can't send emails, and without `FACILITATOR_URL` the
budget calculator can't load. See `.env.example` for every setting.

Other commands:

```bash
npm run build   # production build (run this before deploying to catch errors)
npm run start   # run the production build locally
npm run lint    # check code style
```

---

## 2. Editing content

**Almost everything you'd want to change is in one file: [`data/site.ts`](data/site.ts).**

| What | Where in `data/site.ts` |
| --- | --- |
| Phone, WhatsApp, email, address, GST, Instagram | `business` |
| Home page photo | `images` |
| Services | `services` |
| Packages and prices | `packages`, `packagesNote` |
| Portfolio photos and categories | `gallery` |
| Featured weddings on the home page | `featuredWeddings` |
| Testimonial on the home page | `testimonial` |
| Story and team | `story`, `team` |
| Budget and guest options in the form | `budgetRanges`, `guestRanges` |

Save the file and the site updates. Search the file for `REPLACE` to find every placeholder.

### Using your own photos

1. Save the photo as WebP in `app/assets/`, for example `app/assets/pheras.webp`.
   Aim for around 2000px wide and under 500 KB. To convert a PNG or JPG:
   `cwebp -q 82 -metadata none pheras.png -o pheras.webp`
2. In `data/site.ts`, import it at the top and pass it to `photo()`:

   ```ts
   import pheras from "@/app/assets/pheras.webp";

   hero: photo(pheras, "Bride and groom during pheras at a farmhouse in Chhatarpur"),
   ```

   Width, height and the blurred loading preview come from the file automatically.
   If a crop cuts off the important part, add a focus point: `photo(pheras, "…", "right")`.
3. Always write a real `alt` description. It helps Google and visitors who use screen readers.

Photo slots and their shapes: the home hero is 16:9 (4:3 on phones), service and recent-wedding
cards are 3:2, team photos are 4:5 and the portfolio shows each photo uncropped.

### Colours and fonts

- Colours: edit the `@theme` block at the top of [`app/globals.css`](app/globals.css)
  (`--color-primary` for buttons, `--color-secondary` for secondary buttons, `--color-ivory` for the background).
- Fonts: [`app/layout.tsx`](app/layout.tsx) loads Cormorant Garamond for headings and Inter for body text.

### Logo

Replace the text logo in [`components/layout/Logo.tsx`](components/layout/Logo.tsx) with an `<Image>`
(an example is in the comment there). Replace the favicon at `app/icon.svg`.

---

## 3. How the enquiry form works

1. The visitor fills in the form ([`components/contact/EnquiryForm.tsx`](components/contact/EnquiryForm.tsx)).
   It is checked in the browser with **zod + react-hook-form**, using the rules in
   [`lib/enquirySchema.ts`](lib/enquirySchema.ts) (Indian 10-digit mobile numbers, a date that isn't in the past, and so on).
2. The browser sends it straight to the team's inbox through [Web3Forms](https://web3forms.com)
   ([`lib/web3forms.ts`](lib/web3forms.ts)), the same service and key as the budget calculator's leads.
   - The email subject says what it's about (wedding, package, vendor partnership or other).
   - The email includes one-tap Call and WhatsApp links.
   - Bots that fill in the hidden **honeypot** field are dropped by Web3Forms.
3. The visitor sees a thank-you screen with a **Chat on WhatsApp** button that has their details prefilled.
   If sending fails, they see a WhatsApp fallback instead.

Enquiries are **not stored in a database** yet. They're emailed only.

### Setting up Web3Forms (about 2 minutes)

1. Go to https://web3forms.com and create an access key with the email address that should receive enquiries.
2. Put it in `WEB3FORMS_ACCESS_KEY`.
3. In the Web3Forms dashboard, restrict the key to your domain. The key is public by design: it can only
   deliver to the inbox it was created for.

---

## 4. Deploying to Vercel

1. Push this project to GitHub.
2. Go to https://vercel.com/new and import the repository. Vercel detects Next.js automatically.
3. Before clicking **Deploy**, open **Environment Variables** and add every key from `.env.example`:
   `FACILITATOR_URL`, `BACKEND_URL`, `WEB3FORMS_ACCESS_KEY`, `SITE_URL`, `WHATSAPP_NUMBER`.
4. Click **Deploy**. Every later push to `main` redeploys automatically.

If you change an environment variable later, redeploy (Deployments → ⋯ → Redeploy) so it takes effect.

---

## 5. Connecting dulhaniyaa.com

1. In Vercel, open the project → **Settings → Domains** → add `dulhaniyaa.com`, then add `www.dulhaniyaa.com` too.
   Choose to redirect `www` to the main domain (or the other way round).
2. Vercel shows the DNS records to add. At your registrar (GoDaddy, Hostinger, Namecheap, etc.), open DNS settings and add:
   - an **A** record for `@` pointing to the IP Vercel shows,
   - a **CNAME** record for `www` pointing to the value Vercel shows.
3. Wait from a few minutes to a few hours. Vercel issues the HTTPS certificate automatically.
4. Make sure `SITE_URL` is `https://dulhaniyaa.com`, then redeploy.
5. Add the site to [Google Search Console](https://search.google.com/search-console) and submit
   `https://dulhaniyaa.com/sitemap.xml`.

---

## 6. Project structure

```
app/
  layout.tsx            Fonts, header, footer, WhatsApp button, SEO metadata, LocalBusiness schema
  page.tsx              Home
  services/ portfolio/ packages/ about/ contact/   One folder per page
  sitemap.ts robots.ts  SEO files (served as /sitemap.xml and /robots.txt)
  icon.svg              Favicon
  globals.css           Brand colours and base styles
components/
  layout/               Header, MobileMenu, Footer, Logo, WhatsAppFloat
  home/                 Home page sections (Hero, Intro, Testimonials…). Some are reused on other pages.
  portfolio/            GalleryGrid (filters + masonry) and Lightbox
  contact/              EnquiryForm
  ui/                   Small building blocks: Button, Container, SectionHeading, PageHero,
                        Reveal (scroll fade-in) and Parallax (GSAP)
data/site.ts            ← ALL editable content
lib/                    Form rules, WhatsApp links, rate limiter, GSAP setup
```

### Animations

Scroll effects use GSAP + ScrollTrigger:

- **`<Reveal>`** fades content up as it scrolls into view. Add `stagger` to animate the children one by one.
- **`<Parallax>`** makes an image drift slowly; place it inside a box with `overflow-hidden`.
- The home hero has its own parallax and intro animation.

All animations switch off for visitors who have "reduce motion" turned on in their phone settings.

### A note on this Next.js version

This project uses Next.js 16 with `cacheComponents` turned on. In practice:

- Pages are static by default, which makes them fast.
- Don't use `new Date()` or `Math.random()` directly in server components; this is why the footer has no year.
- Components that read the URL (like the form reading `?package=Gold`) must be wrapped in `<Suspense>`.

Version-matched docs are in `node_modules/next/dist/docs/`.
