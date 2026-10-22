"use client";

import { useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetRanges, guestRanges } from "@/data/site";
import { enquiryEmailRows, enquirySchema, enquiryToWhatsApp, serviceOptions, type Enquiry } from "@/lib/enquirySchema";
import { enquirySubject, purposeFromParams, purposeGroups } from "@/lib/enquiryPurpose";
import { LeadError, sendEnquiryEmail } from "@/lib/web3forms";
import { whatsappLink } from "@/lib/whatsapp";
import { buttonClasses } from "@/components/ui/Button";
import { CheckIcon, WhatsAppIcon } from "@/components/ui/Icons";

type Status =
  | { state: "idle" }
  | { state: "success"; enquiry: Enquiry }
  | { state: "error"; message: string };

const inputClass =
  "block w-full min-h-12 rounded-lg border border-ink/15 bg-white/60 px-4 py-3 text-base text-ink placeholder:text-muted/60 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 aria-invalid:border-red-600";

export function EnquiryForm() {
  const searchParams = useSearchParams();
  const pickedPackage = searchParams.get("package");
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Enquiry>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      purpose: purposeFromParams(searchParams.get("purpose"), pickedPackage),
      name: "",
      phone: "",
      email: "",
      eventDate: "",
      city: "Delhi",
      budget: "",
      guests: "",
      services: [],
      message: pickedPackage ? `I'm interested in the ${pickedPackage} package.` : "",
      website: "",
    },
  });

  // Sent straight to the team's inbox through Web3Forms (same key as the budget calculator's leads).
  async function onSubmit(data: Enquiry) {
    try {
      await sendEnquiryEmail({
        subject: enquirySubject(data),
        replyTo: data.email || undefined,
        fields: enquiryEmailRows(data),
        botcheck: data.website,
      });
      setStatus({ state: "success", enquiry: data });
    } catch (err) {
      setStatus({
        state: "error",
        message:
          err instanceof LeadError && err.message === "NETWORK"
            ? "Check your connection and try again."
            : "We couldn't send your enquiry right now.",
      });
    }
  }

  if (status.state === "success") {
    const { enquiry } = status;
    return (
      <div className="py-8 text-center" role="status">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-primary">
          <CheckIcon width={32} height={32} />
        </div>
        <h2 className="mt-6 text-4xl">
          Thank you, {enquiry.name.split(" ")[0]}!
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
          Your enquiry has reached us. Someone from our team will call you on{" "}
          <strong className="text-ink">{enquiry.phone}</strong> within 24 hours.
        </p>
        <p className="mt-6 text-sm text-muted">Can&apos;t wait? Message us right now:</p>
        <a
          href={whatsappLink(enquiryToWhatsApp(enquiry))}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("secondary", "mt-3")}
        >
          Chat on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-muted">Fields marked * are required.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="What's this about? *" error={errors.purpose?.message} id="purpose">
            <select id="purpose" className={inputClass} aria-invalid={!!errors.purpose} {...register("purpose")}>
              {purposeGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Your name *" error={errors.name?.message} id="name">
          <input id="name" autoComplete="name" className={inputClass} aria-invalid={!!errors.name} {...register("name")} />
        </Field>

        <Field label="Phone number *" error={errors.phone?.message} id="phone">
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98100 00000"
            className={inputClass}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
        </Field>

        <Field label="Email (optional)" error={errors.email?.message} id="email">
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={inputClass}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Wedding date *" error={errors.eventDate?.message} id="eventDate">
          <input id="eventDate" type="date" className={inputClass} aria-invalid={!!errors.eventDate} {...register("eventDate")} />
        </Field>

        <Field label="City *" error={errors.city?.message} id="city">
          <input id="city" autoComplete="address-level2" className={inputClass} aria-invalid={!!errors.city} {...register("city")} />
        </Field>

        <Field label="Guest count *" error={errors.guests?.message} id="guests">
          <select id="guests" className={inputClass} aria-invalid={!!errors.guests} {...register("guests")}>
            <option value="" disabled>
              Select…
            </option>
            {guestRanges.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Approximate budget *" error={errors.budget?.message} id="budget">
            <select id="budget" className={inputClass} aria-invalid={!!errors.budget} {...register("budget")}>
              <option value="" disabled>
                Select a range…
              </option>
              {budgetRanges.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium text-ink">Services you need *</legend>
          <div className="grid grid-cols-2 gap-2">
            {serviceOptions.map((s) => (
              <label
                key={s}
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-ink/15 px-3 py-2 text-sm transition-colors has-checked:border-primary has-checked:bg-secondary/40"
              >
                <input type="checkbox" value={s} className="size-4 accent-primary" {...register("services")} />
                {s}
              </label>
            ))}
          </div>
          {errors.services && <p className="mt-1.5 text-sm text-red-700">{errors.services.message}</p>}
        </fieldset>

        <div className="sm:col-span-2">
          <Field label="Anything else? (optional)" error={errors.message?.message} id="message">
            <textarea
              id="message"
              rows={4}
              placeholder="Functions you're planning, venue ideas, a theme you love…"
              className={inputClass}
              aria-invalid={!!errors.message}
              {...register("message")}
            />
          </Field>
        </div>

        {/* Honeypot: hidden from real visitors. Bots fill it in and get ignored. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
      </div>

      {status.state === "error" && (
        <div role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <p>{status.message} You can also reach us directly on WhatsApp:</p>
          <a
            href={whatsappLink(
              `Hi Dulhaniyaa! My name is ${getValues("name")}. I'd like to enquire about my wedding.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4"
          >
            <WhatsAppIcon width={18} height={18} /> Message us on WhatsApp
          </a>
        </div>
      )}

      <button type="submit" disabled={isSubmitting} className={buttonClasses("primary", "mt-8 w-full disabled:opacity-60")}>
        {isSubmitting ? "Sending…" : "Send enquiry"}
      </button>
      <p className="mt-3 text-center text-xs text-muted">Your details are never shared.</p>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  );
}
