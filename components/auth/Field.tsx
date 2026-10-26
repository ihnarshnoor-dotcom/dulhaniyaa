import type { ReactNode, Ref } from "react";

/** Same look as the enquiry form's inputs. */
export const inputClass =
  "block w-full min-h-12 rounded-lg border border-ink/15 bg-white/60 px-4 py-3 text-base text-ink placeholder:text-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 aria-invalid:border-red-600";

/** Label, input and error message. Give the input `aria-describedby={errorId(id)}`. */
export function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={errorId(id)} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export const errorId = (id: string) => `${id}-error`;

/** The form-level error box. Focusable so the form can move focus to it. */
export function FormAlert({ children, ref }: { children: ReactNode; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} role="alert" tabIndex={-1} className="rounded-lg bg-red-50 p-4 text-sm text-red-800 focus:outline-none">
      {children}
    </div>
  );
}

/** A neutral form-level message, such as "we've sent you a code". */
export function FormNotice({ children }: { children: ReactNode }) {
  return <div className="rounded-lg bg-secondary/40 p-4 text-sm text-ink">{children}</div>;
}
