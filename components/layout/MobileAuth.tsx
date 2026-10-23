"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { buttonClasses } from "@/components/ui/Button";
import { isPhotosApiEnabled } from "@/lib/photosApi";

/** Account entries for the mobile menu. Renders nothing when the photos API is off. */
export function MobileAuth({ onNavigate }: { onNavigate: () => void }) {
  if (!isPhotosApiEnabled) return null;
  return <MobileAuthLinks onNavigate={onNavigate} />;
}

function MobileAuthLinks({ onNavigate }: { onNavigate: () => void }) {
  const { user, loading, logout } = useAuth();

  if (loading) return <div aria-hidden className="shimmer h-12 rounded-full" />;

  if (!user) {
    return (
      <Link href="/login" onNavigate={onNavigate} className={buttonClasses("secondary")}>
        Log in
      </Link>
    );
  }

  const linkClass = "py-1 text-sm font-medium text-primary underline-offset-4 hover:underline";
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-2xl border border-ink/10 px-4 py-3">
      <p className="w-full truncate text-xs text-muted">Signed in as {user.name}</p>
      <Link href="/account" onNavigate={onNavigate} className={linkClass}>
        My account
      </Link>
      <Link href="/account/saved" onNavigate={onNavigate} className={linkClass}>
        Saved photos
      </Link>
      <Link href="/account/upload" onNavigate={onNavigate} className={linkClass}>
        Upload a photo
      </Link>
      <button
        type="button"
        onClick={() => {
          void logout();
          onNavigate();
        }}
        className={linkClass}
      >
        Log out
      </button>
    </div>
  );
}
