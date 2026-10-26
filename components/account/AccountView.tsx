"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button, buttonClasses } from "@/components/ui/Button";
import { friendlyMessage } from "@/lib/photosApi";
import { MyUploads } from "./MyUploads";

/** The /account page body. Rendered inside <RequireAuth>, so there is always a user. */
export function AccountView() {
  const { user, logout, logoutAll } = useAuth();
  const [endingAll, setEndingAll] = useState(false);
  const [endAllError, setEndAllError] = useState<string | null>(null);
  if (!user) return null;

  async function onLogoutAll() {
    setEndingAll(true);
    setEndAllError(null);
    try {
      await logoutAll();
    } catch (err) {
      setEndAllError(friendlyMessage(err));
      setEndingAll(false);
    }
  }

  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone || "Not added" },
  ];

  return (
    <>
      <div className="flex flex-col gap-8 rounded-3xl border border-ink/10 bg-white/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <dl className="grid gap-4 text-sm sm:grid-cols-3 sm:gap-10">
          {details.map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="text-xs tracking-wide text-muted">{label}</dt>
              <dd className="mt-1 truncate text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button href="/account/upload">Upload a photo</Button>
          <Button href="/account/saved" variant="secondary">
            Saved photos
          </Button>
          <Button href="/account/shared" variant="secondary">
            Shared with me
          </Button>
          <button type="button" onClick={() => void logout()} className={buttonClasses("secondary")}>
            Log out
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
        {endAllError && (
          <p role="alert" className="text-red-700">
            {endAllError}
          </p>
        )}
        <button
          type="button"
          onClick={onLogoutAll}
          disabled={endingAll}
          className="py-1 font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60"
        >
          {endingAll ? "Logging out everywhere…" : "Log out of all devices"}
        </button>
      </div>

      <section aria-labelledby="uploads-heading" className="mt-14">
        <h2 id="uploads-heading" className="mb-6 text-3xl sm:text-4xl">
          My uploads
        </h2>
        <MyUploads />
      </section>
    </>
  );
}
