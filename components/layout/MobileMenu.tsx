"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect } from "react";
import { business, navLinks } from "@/data/site";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { whatsappLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

type Props = { open: boolean; onClose: () => void; pathname: string };

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
      hidden={!open}
      className="fixed inset-0 z-50 flex flex-col bg-ivory text-ink lg:hidden"
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
        {navLinks.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onNavigate={onClose}
              aria-current={active ? "page" : undefined}
              className={`py-2 font-serif text-4xl ${active ? "text-primary" : "text-ink"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 px-6 pb-10">
        <Link href="/budget-calculator" onNavigate={onClose} className={buttonClasses("primary")}>
          Plan my budget
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
