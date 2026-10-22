import Link from "next/link";
import { business, navLinks } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { whatsappLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

export function Footer() {
  const { address, social } = business;
  const linkClass = "transition-colors hover:text-primary";

  return (
    <footer className="border-t border-ink/10 text-sm text-muted">
      <Container className="grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <Logo />
          <a href={business.mapLink} target="_blank" rel="noopener noreferrer" className={`mt-4 block ${linkClass}`}>
            {address.line2}, {address.city}
          </a>
        </div>

        <nav aria-label="Footer">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="space-y-2">
          <li>
            <a href={`tel:${business.phoneHref}`} className={linkClass}>
              {business.phoneDisplay}
            </a>
          </li>
          <li>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkClass}>
              WhatsApp
            </a>
          </li>
          <li>
            <a href={`mailto:${business.email}`} className={linkClass}>
              {business.email}
            </a>
          </li>
          <li>
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {social.instagramHandle}
            </a>
          </li>
          <li>
            <a href={social.youtube} target="_blank" rel="noopener noreferrer" className={linkClass}>
              YouTube
            </a>
          </li>
        </ul>
      </Container>

      <Container className="pb-8 text-xs text-muted/80">
        © {business.name} · GSTIN {business.gstNumber}
      </Container>
    </footer>
  );
}
