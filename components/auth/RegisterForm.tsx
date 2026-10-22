"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/lib/authSchemas";
import { friendlyMessage, PhotosApiError } from "@/lib/photosApi";
import { safeNextPath } from "@/lib/safeNext";
import { buttonClasses } from "@/components/ui/Button";
import { useAuth } from "./AuthProvider";
import { errorId, Field, FormAlert, inputClass } from "./Field";
import { FormPlaceholder } from "./LoginForm";
import { PasswordInput } from "./PasswordInput";

export function RegisterForm() {
  const router = useRouter();
  const nextParam = useSearchParams().get("next");
  const next = safeNextPath(nextParam);
  const loginLink = nextParam ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const { user, loading, register: createAccount } = useAuth();
  const [serverError, setServerError] = useState<{ message: string; emailTaken: boolean } | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  // Set while this form signs someone in, so the "already signed in" redirect doesn't race the ?next redirect.
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!loading && user && !submitted) router.replace("/account");
  }, [loading, user, submitted, router]);

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  async function onSubmit({ name, email, phone, password }: RegisterValues) {
    setServerError(null);
    try {
      setSubmitted(true);
      await createAccount({ name, email, password, phone });
      router.replace(next);
    } catch (err) {
      setSubmitted(false);
      setServerError({
        message: friendlyMessage(err, "signup"),
        emailTaken: err instanceof PhotosApiError && err.status === 409,
      });
    }
  }

  if (loading || (user && !submitted)) return <FormPlaceholder />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <FormAlert ref={alertRef}>
          {serverError.message}
          {serverError.emailTaken && (
            <>
              {" "}
              <Link href={loginLink} className="font-semibold text-primary underline underline-offset-4">
                Go to log in
              </Link>
            </>
          )}
        </FormAlert>
      )}

      <p className="text-sm text-muted">Fields marked * are required.</p>

      <Field label="Your name *" id="name" error={errors.name?.message}>
        <input
          id="name"
          autoComplete="name"
          className={inputClass}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? errorId("name") : undefined}
          {...register("name")}
        />
      </Field>

      <Field label="Email *" id="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className={inputClass}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? errorId("email") : undefined}
          {...register("email")}
        />
      </Field>

      <Field label="Phone (optional)" id="phone" error={errors.phone?.message}>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98100 00000"
          className={inputClass}
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? errorId("phone") : undefined}
          {...register("phone")}
        />
      </Field>

      <Field label="Password *" id="password" hint="At least 8 characters." error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? errorId("password") : undefined}
          {...register("password")}
        />
      </Field>

      <Field label="Confirm password *" id="confirmPassword" error={errors.confirmPassword?.message}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? errorId("confirmPassword") : undefined}
          {...register("confirmPassword")}
        />
      </Field>

      <button type="submit" disabled={isSubmitting} className={buttonClasses("primary", "w-full disabled:opacity-60")}>
        {isSubmitting ? "Creating your account…" : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={loginLink} className="font-medium text-primary underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
