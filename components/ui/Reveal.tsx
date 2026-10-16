"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** Animate each direct child one after another instead of the whole block. */
  stagger?: boolean;
  delay?: number;
};

/**
 * Fades and slides content up as it scrolls into view.
 * Does nothing for visitors who prefer reduced motion.
 */
export function Reveal({ children, className, stagger = false, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(stagger ? el.children : el, {
          autoAlpha: 0,
          y: 36,
          duration: 0.9,
          delay,
          ease: "power3.out",
          stagger: stagger ? 0.12 : 0,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
