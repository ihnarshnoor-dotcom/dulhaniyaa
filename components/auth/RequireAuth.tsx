"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { loginHref } from "@/lib/safeNext";
import { useAuth } from "./AuthProvider";

/** Shows its children only to signed-in visitors. Everyone else is sent to /login and brought back afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, signedOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(signedOut ? "/" : loginHref(pathname));
  }, [loading, user, signedOut, router, pathname]);

  if (loading || !user) {
    return (
      <div role="status" aria-label="Loading your account" className="space-y-4">
        <div className="shimmer h-8 w-48 rounded-full" />
        <div className="shimmer h-40 rounded-3xl" />
      </div>
    );
  }
  return children;
}
