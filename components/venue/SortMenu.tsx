"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";

/**
 * "Sort: Most popular ▾" on the venue listing. A styled dropdown instead of the browser's own select:
 * opens below the pill, closes on a pick, a click outside or Escape, and arrow keys move between options.
 */
export function SortMenu<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const current = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    // Focus the picked option so arrow keys start from there.
    list.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const items = [...(list.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(i + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      items[e.key === "Home" ? 0 : items.length - 1]?.focus();
    }
  };

  return (
    <div ref={wrapper} className="relative flex-1 sm:flex-none">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={`inline-flex min-h-12 w-full items-center gap-2 rounded-full border bg-white/80 pr-4 pl-5 text-sm whitespace-nowrap transition sm:w-auto ${
          open ? "border-primary text-primary" : "border-ink/15 text-ink hover:border-primary/50"
        }`}
      >
        <ArrowUpDown className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
        <span className="text-muted">Sort:</span>
        <span className="font-medium">{current.label}</span>
        <ChevronDown
          className={`ml-auto size-4 shrink-0 transition-transform duration-200 sm:ml-1 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>

      <ul
        ref={list}
        id={listId}
        role="listbox"
        aria-label="Sort venues by"
        onKeyDown={onListKey}
        className={`absolute top-full right-0 z-30 mt-2 w-full min-w-56 origin-top-right rounded-2xl border border-ink/10 bg-white/95 p-1.5 shadow-xl shadow-ink/10 backdrop-blur-md transition duration-150 sm:w-auto ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        {options.map((o) => {
          const selected = o.id === value;
          return (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  onChange(o.id);
                  close();
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm outline-none transition hover:bg-secondary/60 focus-visible:bg-secondary/60 ${
                  selected ? "font-medium text-primary" : "text-ink"
                }`}
              >
                {o.label}
                {selected && <Check className="size-4 shrink-0" strokeWidth={2} aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
