"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const EDGE = 16; // keep the bubble this far from the screen edges
const GAP = 12; // space between the pill and the bubble

/**
 * A service pill that pops open a small speech bubble explaining the service when pressed.
 * Works the same on phone and desktop: press to open, press again, press anywhere else or hit Esc to close.
 * Opening another pill closes this one, because that press lands outside it.
 */
export function ServiceChip({ name, info }: { name: string; info: string }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // stays true while the closing animation plays
  const [shift, setShift] = useState(0);
  const [above, setAbove] = useState(false);
  const root = useRef<HTMLLIElement>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const id = useId();

  // Before it shows, nudge the bubble sideways so it stays on screen, and flip it above the pill near the bottom.
  useLayoutEffect(() => {
    if (!open || !bubble.current || !root.current) return;
    const pill = root.current.getBoundingClientRect();
    const { offsetWidth: w, offsetHeight: h } = bubble.current;
    const center = pill.left + pill.width / 2;
    let next = 0;
    if (center - w / 2 < EDGE) next = EDGE - (center - w / 2);
    else if (center + w / 2 > window.innerWidth - EDGE) next = window.innerWidth - EDGE - (center + w / 2);
    setShift(next);
    setAbove(pill.bottom + GAP + h > window.innerHeight - EDGE && pill.top > h + GAP + EDGE);
  }, [open]);

  // Take the bubble out of the page once it has faded, so a hidden bubble can't widen the page.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setShown(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  // The bubble grows out of the point where its tail meets the pill.
  const tail = `calc(50% - ${shift}px)`;

  return (
    <li ref={root} className={`relative ${open ? "z-20" : ""}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setShown(true);
          setOpen((o) => !o);
        }}
        className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-left text-sm transition-all duration-200 active:scale-95 ${
          open
            ? "border-primary/40 bg-secondary/70 text-primary-dark shadow-md shadow-primary/10"
            : "border-ink/10 bg-ivory text-ink/80 hover:border-primary/40 hover:bg-secondary/60 hover:text-primary-dark"
        }`}
      >
        {name}
      </button>

      {shown && (
        <div
          ref={bubble}
          id={id}
          role="status"
          style={{
            left: `calc(50% + ${shift}px)`,
            transformOrigin: `${tail} ${above ? "bottom" : "top"}`,
          }}
          className={`absolute w-64 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-primary/15 bg-ivory px-4 py-3.5 shadow-xl shadow-primary/15 transition-[opacity,scale,translate] motion-reduce:transition-none ${
            above ? "bottom-full mb-3" : "top-full mt-3"
          } ${
            open
              ? `translate-y-0 scale-100 opacity-100 duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] starting:scale-75 starting:opacity-0 ${above ? "starting:translate-y-1" : "starting:-translate-y-1"}`
              : `pointer-events-none scale-75 opacity-0 duration-150 ease-in ${above ? "translate-y-1" : "-translate-y-1"}`
          }`}
        >
          <p className="font-serif text-lg leading-tight text-primary-dark">{name}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{info}</p>
  
          {/* Tail pointing back to the pill */}
          <span
            aria-hidden
            style={{ left: tail }}
            className={`absolute size-3 -translate-x-1/2 rotate-45 bg-ivory ${
              above
                ? "-bottom-1.5 border-r border-b border-primary/15"
                : "-top-1.5 border-t border-l border-primary/15"
            }`}
          />
        </div>
      )}
    </li>
  );
}
