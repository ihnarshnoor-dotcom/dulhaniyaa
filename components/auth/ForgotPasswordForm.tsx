"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  RESET_CODE_LENGTH,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "@/lib/authSchemas";
import { forgotPassword, friendlyMessage, isInvalidResetCode, PhotosApiError, resetPassword } from "@/lib/photosApi";
import {
  codeDigits,
  loginAfterResetHref,
  loginLinkHref,
  RESEND_COOLDOWN_SECONDS,
  resendLabel,
  resetErrorField,
  secondsLeft,
} from "@/lib/passwordReset";
import { buttonClasses } from "@/components/ui/Button";
import { errorId, Field, FormAlert, FormNotice, inputClass } from "./Field";
import { PasswordInput } from "./PasswordInput";

const linkButton = "font-medium text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:text-muted disabled:no-underline";

/** Seconds until another code may be asked for. `start` begins a new wait. */
function useResendCooldown() {
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(0);
  const left = secondsLeft(until, now);

  useEffect(() => {
    if (left === 0) return;
    const timer = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(timer);
  }, [left, now]);

  const start = useCallback(() => {
    const t = Date.now();
    setNow(t);
    setUntil(t + RESEND_COOLDOWN_SECONDS * 1000);
  }, []);

  return { left, start };
}

/**
 * Step 1 asks for the email and sends a code; step 2 takes the code and the new password.
 * Step 2 always follows step 1, so the screen never says whether an account exists.
 * Everything stays in component state: nothing goes in the URL or browser storage.
 */
export function ForgotPasswordForm() {
  const router = useRouter();
  const nextParam = useSearchParams().get("next");
  // The address a code was asked for. Set means step 2.
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const cooldown = useResendCooldown();

  const emailForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const resetForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });
  const emailErrors = emailForm.formState.errors;
  const resetErrors = resetForm.formState.errors;
  const busy = sending || resetForm.formState.isSubmitting;

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  /** Asks for a code (first time or again). True once the backend accepted it. */
  async function requestCode(address: string) {
    setServerError(null);
    setSending(true);
    try {
      const message = await forgotPassword(address);
      setStatus(message);
      cooldown.start();
      return true;
    } catch (err) {
      const message = friendlyMessage(err, "forgotPassword");
      if (err instanceof PhotosApiError && err.status === 429) cooldown.start();
      if (err instanceof PhotosApiError && err.status === 400 && !email) {
        emailForm.setError("email", { message }, { shouldFocus: true });
      } else {
        setServerError(message);
      }
      return false;
    } finally {
      setSending(false);
    }
  }

  async function sendCode({ email: address }: ForgotPasswordValues) {
    // Enter in the read-only email field submits this form again; step 2 has its own resend.
    if (email) return;
    if (await requestCode(address)) setEmail(address);
  }

  async function resendCode() {
    if (!email || busy || cooldown.left > 0) return;
    if (await requestCode(email)) {
      // The new code replaces the old one.
      resetForm.setValue("code", "");
      resetForm.clearErrors("code");
      resetForm.setFocus("code");
    }
  }

  function changeEmail() {
    setEmail(null);
    setStatus(null);
    setServerError(null);
    resetForm.reset();
    emailForm.setFocus("email");
  }

  async function onReset({ code, password, confirmPassword }: ResetPasswordValues) {
    if (!email) return;
    setServerError(null);
    try {
      await resetPassword({ email, code, password, confirmPassword });
    } catch (err) {
      const message = friendlyMessage(err, "resetPassword");
      const field = err instanceof PhotosApiError && err.status === 400 ? resetErrorField(message) : null;
      if (field && field !== "email") {
        resetForm.setError(field, { type: isInvalidResetCode(err) ? "invalidCode" : "server", message }, { shouldFocus: field !== "code" });
        if (field === "code") resetForm.setFocus("code", { shouldSelect: true });
      } else {
        setServerError(message);
      }
      return;
    }
    // Forget everything typed before leaving. The backend doesn't log in, so the login page comes next.
    resetForm.reset();
    emailForm.reset();
    setEmail(null);
    setStatus(null);
    setDone(true);
    router.replace(loginAfterResetHref(nextParam));
  }

  if (done) {
    return (
      <div role="status">
        <FormNotice>Password updated. Taking you to log in…</FormNotice>
      </div>
    );
  }

  const codeRegistration = resetForm.register("code");
  const badCode = resetErrors.code?.type === "invalidCode";

  return (
    <div className="space-y-5">
      {serverError && <FormAlert ref={alertRef}>{serverError}</FormAlert>}

      <form onSubmit={emailForm.handleSubmit(sendCode)} noValidate className="space-y-5">
        {!email && <p className="text-sm text-muted">Enter the email you use to log in and we&apos;ll send you a code.</p>}

        <Field label="Email" id="email" error={emailErrors.email?.message}>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            readOnly={!!email}
            className={`${inputClass} read-only:bg-ink/5 read-only:text-muted`}
            aria-invalid={!!emailErrors.email}
            aria-describedby={emailErrors.email ? errorId("email") : undefined}
            {...emailForm.register("email")}
          />
        </Field>

        {email ? (
          <p className="text-sm">
            <button type="button" onClick={changeEmail} disabled={busy} className={linkButton}>
              Use a different email
            </button>
          </p>
        ) : (
          <button type="submit" disabled={busy} className={buttonClasses("primary", "w-full disabled:opacity-60")}>
            {sending ? "Sending…" : "Send code"}
          </button>
        )}
      </form>

      {/* Always mounted, so screen readers announce the message when it appears. */}
      <div aria-live="polite">{status && <FormNotice>{status}</FormNotice>}</div>

      {email && (
        <form onSubmit={resetForm.handleSubmit(onReset)} noValidate className="space-y-5">
          {/* Lets password managers file the new password under this account. */}
          <input type="email" autoComplete="username" value={email} readOnly hidden aria-hidden tabIndex={-1} />

          <Field label="6-digit code" id="code" error={resetErrors.code?.message}>
            <p id="code-hint" className="mb-2 text-xs text-muted">
              Enter the 6-digit code we emailed you. It can take a minute to arrive; check your spam folder too.
            </p>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={RESET_CODE_LENGTH}
              autoFocus
              className={`${inputClass} font-mono tracking-[0.3em]`}
              aria-invalid={!!resetErrors.code}
              aria-describedby={resetErrors.code ? `code-hint ${errorId("code")}` : "code-hint"}
              {...codeRegistration}
              onChange={(e) => {
                e.target.value = codeDigits(e.target.value);
                return codeRegistration.onChange(e);
              }}
            />
          </Field>

          <div className="-mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            {badCode && <span>Codes last 10 minutes and stop working after 5 wrong tries.</span>}
            <button type="button" onClick={resendCode} disabled={busy || cooldown.left > 0} className={linkButton}>
              {resendLabel(cooldown.left)}
            </button>
          </div>

          <Field label="New password" id="password" hint="At least 8 characters." error={resetErrors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              aria-invalid={!!resetErrors.password}
              aria-describedby={resetErrors.password ? errorId("password") : undefined}
              {...resetForm.register("password")}
            />
          </Field>

          <Field label="Confirm new password" id="confirmPassword" error={resetErrors.confirmPassword?.message}>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              aria-invalid={!!resetErrors.confirmPassword}
              aria-describedby={resetErrors.confirmPassword ? errorId("confirmPassword") : undefined}
              {...resetForm.register("confirmPassword")}
            />
          </Field>

          <button type="submit" disabled={busy} className={buttonClasses("primary", "w-full disabled:opacity-60")}>
            {resetForm.formState.isSubmitting ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href={loginLinkHref(nextParam)} className="font-medium text-primary underline underline-offset-4">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
