"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { b2b, headerLinks } from "@/data/site";
import { buttonClasses } from "@/components/ui/Button";
import { MenuIcon } from "@/components/ui/Icons";
import { B2BMenu } from "./B2BMenu";
import { HeaderAuth } from "./HeaderAuth";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { navLinkClasses } from "./navItem";

// The logo already links home. "Plan my wedding" leads the nav as a solid button; the mobile menu has its own.
const desktopLinks = headerLinks.filter((link) => link.href !== "/");

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b bg-ivory/65 backdrop-blur-md transition-colors duration-300 ${
          scrolled ? "border-ink/10" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:justify-items-start">
          <Logo />

          <nav
            aria-label="Main"
            className="hidden items-center gap-2 lg:flex lg:justify-self-center"
          >
            <Link
              href="/plan-my-wedding"
              aria-current={pathname.startsWith("/plan-my-wedding") ? "page" : undefined}
              className={buttonClasses("primary", "cta-shine mr-2 min-h-10 px-5 py-2 whitespace-nowrap bg-primary/85! hover:bg-primary!")}
            >
              Plan my wedding
            </Link>
            {desktopLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={navLinkClasses(active)}
                >
                  {link.label}
                </Link>
              );
            })}
            <B2BMenu active={pathname.startsWith(b2b.href)} />
          </nav>

          <div className="flex items-center gap-2 lg:justify-self-end">
            <HeaderAuth />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="grid size-11 place-items-center rounded-full text-ink lg:hidden"
            >
              <MenuIcon width={24} height={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Rendered outside <header> so the blur effect doesn't clip the overlay. */}
      <MobileMenu open={menuOpen} onClose={closeMenu} pathname={pathname} />
    </>
  );
}
