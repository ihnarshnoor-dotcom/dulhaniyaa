"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button, buttonClasses } from "@/components/ui/Button";
import { MyUploads } from "./MyUploads";

/** The /account page body. Rendered inside <RequireAuth>, so there is always a user. */
export function AccountView() {
  const { user, logout } = useAuth();
  if (!user) return null;

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
          <button type="button" onClick={logout} className={buttonClasses("secondary")}>
            Log out
          </button>
        </div>
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
