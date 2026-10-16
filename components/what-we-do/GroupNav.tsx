"use client";

import { useEffect, useRef, useState } from "react";

type Props = { groups: { id: string; title: string }[] };

/** Sticky pill menu that highlights the group currently on screen. */
export function GroupNav({ groups }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);

  // On narrow screens the menu scrolls sideways: keep the active pill in view.
  useEffect(() => {
    const el = list.current;
    const pill = el?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!el || !pill) return;
    el.scrollTo({ left: pill.offsetLeft - (el.clientWidth - pill.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      // A section counts as active when it crosses the middle of the screen.
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const g of groups) {
      const el = document.getElementById(g.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [groups]);

  return (
    <nav aria-label="Service groups" className="sticky top-[4.5rem] z-30 py-3 sm:top-20">
      <ol ref={list} className="relative mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/60 bg-white/60 p-1.5 shadow-lg shadow-primary/5 backdrop-blur-xl [scrollbar-width:none]">
        {groups.map((g, i) => (
          <li key={g.id} className="shrink-0">
            <a
              href={`#${g.id}`}
              aria-current={active === g.id ? "true" : undefined}
              className={`block rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors duration-300 ${
                active === g.id ? "bg-primary text-white" : "text-muted hover:text-ink"
              }`}
            >
              <span className="mr-1.5 text-xs opacity-60">{String(i + 1).padStart(2, "0")}</span>
              {g.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
