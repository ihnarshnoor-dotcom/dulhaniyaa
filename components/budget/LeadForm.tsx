"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { LockKeyhole } from "lucide-react";
import { z } from "zod";
import { indianMobile } from "@/lib/enquirySchema";
import { buttonClasses } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(indianMobile, "Enter a valid 10-digit Indian mobile number"),
  email: z.email("Enter a valid email address").max(120),
});

export type Contact = z.infer<typeof contactSchema>;
type Errors = Partial<Record<keyof Contact, string>>;

type Props = {
  open: boolean;
  sending: boolean;
  failed: "NETWORK" | "SERVER" | null;
  onClose: () => void;
  /** `website` is the hidden honeypot field: empty for real visitors. */
  onSubmit: (contact: Contact, website: string) => void;
};

/** Details we ask for before running the AI plan. Shown as a popup. */
export function LeadForm({ open, sending, failed, onClose, onSubmit }: Props) {
  const [values, setValues] = useState<Contact>({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [website, setWebsite] = useState("");
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstInput.current?.focus();
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && !sending && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, sending, onClose]);

  // Close if Next.js hides this page in the background.
  useLayoutEffect(() => onClose, [onClose]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Contact;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit(parsed.data, website);
  }

  const field = (
    key: keyof Contact,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label
        htmlFor={`lead-${key}`}
        className="mb-1.5 block text-sm font-medium"
      >
        {label}
      </label>
      <input
        id={`lead-${key}`}
        ref={key === "name" ? firstInput : undefined}
        value={values[key]}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `lead-${key}-error` : undefined}
        disabled={sending}
        className={`min-h-12 w-full rounded-xl border bg-white/80 px-4 outline-none transition focus:border-primary disabled:opacity-60 ${
          errors[key] ? "border-primary" : "border-ink/15"
        }`}
        {...props}
      />
      {errors[key] && (
        <p id={`lead-${key}-error`} className="mt-1 text-xs text-primary">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-title"
      className="preview-in fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-md sm:items-center sm:p-6"
      onClick={() => !sending && onClose()}
    >
      <div
        className="photo-in relative w-full max-w-md rounded-t-4xl border border-white/60 bg-ivory/95 p-6 shadow-2xl backdrop-blur-xl sm:rounded-4xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={sending}
          aria-label="Close"
          className="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-muted transition hover:bg-secondary hover:text-ink disabled:opacity-40"
        >
          <CloseIcon width={20} height={20} />
        </button>

        <span
          className="grid size-12 place-items-center rounded-full bg-secondary text-primary"
          aria-hidden
        >
          <LockKeyhole className="size-6" strokeWidth={1.6} />
        </span>
        <h2 id="lead-title" className="mt-4 text-3xl leading-tight">
          One last step
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Tell us who you are and we&apos;ll unlock your personalised plan. Our
          planner may call to help you with it.
        </p>

        <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4">
          {field("name", "Your name", { autoComplete: "name", maxLength: 80 })}
          {field("phone", "Mobile number", {
            type: "tel",
            inputMode: "tel",
            autoComplete: "tel",
            placeholder: "",
          })}
          {field("email", "Email", {
            type: "email",
            inputMode: "email",
            autoComplete: "email",
            maxLength: 120,
          })}

          {/* Honeypot: hidden from real visitors. Bots fill it in and get ignored. */}
          <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="lead-website">Website</label>
            <input
              id="lead-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {failed && (
            <p
              role="alert"
              className="rounded-xl bg-secondary/70 px-4 py-3 text-sm text-primary-dark"
            >
              {failed === "NETWORK"
                ? "Check your connection and try again."
                : "We couldn't send your details just now. Please try again."}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className={buttonClasses("primary", "w-full disabled:opacity-60")}
          >
            {sending ? "Sending…" : failed ? "Try again" : "Unlock my plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
