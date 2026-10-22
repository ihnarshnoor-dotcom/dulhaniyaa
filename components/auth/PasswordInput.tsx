"use client";

import { useState, type ComponentProps } from "react";
import { inputClass } from "./Field";

type Props = Omit<ComponentProps<"input">, "type" | "className"> & { id: string };

/** Password field with a show/hide button. */
export function PasswordInput({ id, ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={visible ? "text" : "password"} className={`${inputClass} pr-20`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-controls={id}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-1 right-1 rounded-md px-3 text-xs font-medium tracking-wide text-primary transition-colors hover:bg-secondary/50"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
