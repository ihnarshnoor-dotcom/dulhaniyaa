"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect } from "react";
import { b2b, business, headerLinks } from "@/data/site";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { whatsappLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";
import { MobileAuth } from "./MobileAuth";

type Props = { open: boolean; onClose: () => void; pathname: string };

// Soft ease-out, the same curve as the site's other entrance animations.
const ease = "ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
// Each item fades up a little, one after another; on close they all fade together.
const item = (open: boolean) =>
  `transition-[opacity,translate] duration-500 ${ease} ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`;
const delay = (open: boolean, step: number) => ({ transitionDelay: open ? `${80 + step * 45}ms` : "0ms" });

export function MobileMenu({ open, onClose, pathname }: Props) {
  // Lock page scroll and allow closing with Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Next.js keeps visited pages alive in the background; make sure the menu
  // is closed if this page gets hidden while it is open.
  useLayoutEffect(() => onClose, [onClose]);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      // Stays rendered so it can animate out; `inert` + `invisible` keep it out of reach while closed.
      inert={!open}
      className={`fixed inset-0 z-50 flex flex-col bg-ivory text-ink transition-[opacity,visibility,translate] duration-300 lg:hidden ${ease} ${
        open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"
      }`}
    >
      <div className="flex h-18 items-center justify-between px-4">
        <Logo onNavigate={onClose} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="grid size-11 place-items-center rounded-full text-ink"
        >
          <CloseIcon width={24} height={24} />
        </button>
      </div>

      <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-2 px-6">
        {headerLinks.map((link, i) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onNavigate={onClose}
              aria-current={active ? "page" : undefined}
              style={delay(open, i)}
              className={`py-2 font-serif text-4xl ${active ? "text-primary" : "text-ink"} ${item(open)}`}
            >
              {link.label}
            </Link>
          );
        })}
        <Link
          href={b2b.href}
          onNavigate={onClose}
          aria-current={pathname.startsWith(b2b.href) ? "page" : undefined}
          style={delay(open, headerLinks.length)}
          className={`py-2 font-serif text-4xl ${pathname.startsWith(b2b.href) ? "text-primary" : "text-ink"} ${item(open)}`}
        >
          {b2b.label}
        </Link>
      </nav>

      <div style={delay(open, headerLinks.length + 1)} className={`flex flex-col gap-3 px-6 pb-10 ${item(open)}`}>
        <MobileAuth onNavigate={onClose} />
        <Link href="/plan-my-wedding" onNavigate={onClose} className={buttonClasses("primary")}>
          Plan my wedding
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("secondary", "px-3")}
          >
            WhatsApp
          </a>
          <a href={`tel:${business.phoneHref}`} className={buttonClasses("secondary", "px-3")}>
            Call us
          </a>
        </div>
      </div>
    </div>
  );
}
