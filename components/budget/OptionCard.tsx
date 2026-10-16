import type { ReactNode } from "react";
import { CheckIcon } from "@/components/ui/Icons";

type Props = {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

/** A big tappable choice. Shows a tick badge when selected. */
export function OptionCard({ selected, onClick, children, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 active:scale-[0.97] ${
        selected
          ? "border-primary bg-secondary/70 shadow-md shadow-primary/10"
          : "border-ink/10 bg-white/60 backdrop-blur-sm hover:border-primary/40"
      } ${className}`}
    >
      {selected && (
        <span className="pop absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-primary text-white shadow">
          <CheckIcon width={14} height={14} />
        </span>
      )}
      {children}
    </button>
  );
}

/** A smaller pill-shaped choice. */
export function OptionChip({ selected, onClick, children, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-11 rounded-full border px-5 py-2 text-sm transition duration-200 active:scale-95 ${
        selected
          ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
          : "border-ink/15 bg-white/60 text-ink backdrop-blur-sm hover:border-primary/50 hover:text-primary"
      } ${className}`}
    >
      {children}
    </button>
  );
}
