"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/authSchemas";
import { friendlyMessage } from "@/lib/photosApi";
import { safeNextPath } from "@/lib/safeNext";
import { buttonClasses } from "@/components/ui/Button";
import { useAuth } from "./AuthProvider";
import { errorId, Field, FormAlert, inputClass } from "./Field";
import { PasswordInput } from "./PasswordInput";

export function LoginForm() {
  const router = useRouter();
  const nextParam = useSearchParams().get("next");
  const next = safeNextPath(nextParam);
  const { user, loading, login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  // Set while this form signs someone in, so the "already signed in" redirect doesn't race the ?next redirect.
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Already signed in: nothing to do here.
  useEffect(() => {
    if (!loading && user && !submitted) router.replace("/account");
  }, [loading, user, submitted, router]);

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  async function onSubmit({ email, password }: LoginValues) {
    setServerError(null);
    try {
      setSubmitted(true);
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setSubmitted(false);
      setServerError(friendlyMessage(err, "login"));
    }
  }

  if (loading || (user && !submitted)) return <FormPlaceholder />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {serverError && (
        <FormAlert ref={alertRef}>{serverError}</FormAlert>
      )}

      <Field label="Email" id="email" error={errors.email?.message}>
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

      <Field label="Password" id="password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? errorId("password") : undefined}
          {...register("password")}
        />
      </Field>

      <button type="submit" disabled={isSubmitting} className={buttonClasses("primary", "w-full disabled:opacity-60")}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link
          href={nextParam ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-primary underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function FormPlaceholder() {
  return (
    <div role="status" aria-label="Loading" className="space-y-5">
      <div className="shimmer h-20 rounded-lg" />
      <div className="shimmer h-20 rounded-lg" />
      <div className="shimmer h-12 rounded-full" />
    </div>
  );
}
