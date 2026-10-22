"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { b2b } from "@/data/site";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * "Dulhaniyaa B2B ▾" in the header. The label goes to /vendors; the dropdown of services opens on hover
 * for mouse users, and from the arrow button on touch screens and keyboards. Animated with GSAP.
 */
export function B2BMenu({ active }: { active: boolean }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Drop in with the items cascading; fade up and out on close. Instant for reduced motion.
  useGSAP(
    () => {
      const el = panel.current;
      if (!el) return;
      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const items = el.querySelectorAll("li");
      if (open) {
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: still ? 0 : 0.3,
          ease: "power3.out",
          overwrite: true,
        });
        if (!still)
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: -6 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
              stagger: 0.03,
              delay: 0.05,
              overwrite: true,
            },
          );
      } else {
        gsap.to(el, {
          autoAlpha: 0,
          y: -8,
          scale: 0.97,
          duration: still ? 0 : 0.18,
          ease: "power2.in",
          overwrite: true,
        });
      }
    },
    { dependencies: [open], scope: wrapper },
  );

  // Close on a click outside or on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: globalThis.PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hover = (state: boolean) => (e: PointerEvent) => {
    if (e.pointerType === "mouse") setOpen(state);
  };

  return (
    <div
      ref={wrapper}
      className="relative"
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
      // Close when keyboard focus moves out of the menu.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <div className="flex items-center gap-0.5">
        <Link
          href={b2b.href}
          onNavigate={() => setOpen(false)}
          aria-current={active ? "page" : undefined}
          className={`text-sm tracking-wide transition-colors ${active ? "text-muted" : "text-muted hover:text-ink"}`}
        >
          {b2b.label}
        </Link>
        <button
          ref={button}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${b2b.label} services`}
          className={`grid size-6 place-items-center rounded-full transition-colors hover:bg-secondary/60 ${active ? "text-primary" : "text-muted hover:text-ink"}`}
        >
          <svg
            aria-hidden
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* pt-3 bridges the gap so the menu doesn't close while the mouse moves down to it.
          Always rendered so it can animate out; starts hidden (GSAP takes over), inert while closed. */}
      <div
        ref={panel}
        id={listId}
        inert={!open}
        className="invisible absolute top-full left-1/2 z-50 w-120 origin-top -translate-x-1/2 pt-3 opacity-0"
      >
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-ivory py-1.5 shadow-xl shadow-ink/10">
          {/* <p className="border-b border-ink/10 px-4 pt-1 pb-2.5 text-xs text-muted">For wedding businesses</p> */}
          {/* Two columns keep all the services in view without a very tall list. */}
          <ul className="grid grid-cols-2 px-1.5 py-1">
            {b2b.services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`${b2b.href}/${s.slug}`}
                  prefetch
                  onNavigate={() => setOpen(false)}
                  className="block rounded-lg px-3 py-1.5 text-sm text-ink transition-colors hover:bg-secondary/50 focus:bg-secondary/50 focus:outline-none"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/vendors"
            onNavigate={() => setOpen(false)}
            className="mt-1 block border-t border-ink/10 px-4 pt-2.5 pb-1.5 text-sm font-medium text-primary transition-colors hover:bg-secondary/50 focus:bg-secondary/50 focus:outline-none"
          >
            Browse all vendors →
          </Link>
        </div>
      </div>
    </div>
  );
}
