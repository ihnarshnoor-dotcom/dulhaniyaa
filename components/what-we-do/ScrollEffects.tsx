"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Scroll animations for the What We Do page, driven by data attributes:
 *  data-parallax  → the image inside drifts as the page scrolls
 *  data-reveal    → fades and slides up when it enters the screen
 *  data-stagger   → its children pop in one after another
 *  data-strip     → slides sideways as the page scrolls
 * Visitors who prefer reduced motion see everything without animation.
 */
export function ScrollEffects({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((frame) => {
          const img = frame.querySelector("img");
          if (!img) return;
          gsap.fromTo(
            img,
            { yPercent: -8, scale: 1.18 },
            {
              yPercent: 8,
              scale: 1.08,
              ease: "none",
              scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            autoAlpha: 0,
            y: 48,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
          gsap.from(el.children, {
            autoAlpha: 0,
            y: 14,
            scale: 0.92,
            duration: 0.45,
            ease: "back.out(1.6)",
            stagger: 0.025,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-strip]").forEach((el) => {
          const direction = el.dataset.strip === "right" ? 1 : -1;
          gsap.fromTo(
            el,
            { xPercent: direction === -1 ? 0 : -25 },
            {
              xPercent: direction === -1 ? -25 : 0,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
