"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import * as api from "@/lib/photosApi";
import { normalizePhone } from "@/lib/authSchemas";
import { refreshDelay } from "@/lib/authSession";
import { loginHref } from "@/lib/safeNext";

type RegisterInput = { name: string; email: string; password: string; phone?: string };

type AuthValue = {
  user: api.User | null;
  /** True while the session is being restored from the refresh cookie. */
  loading: boolean;
  /** True after the visitor logged out on purpose (protected pages then go home, not to /login). */
  signedOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Ends every session on every device. Throws if the server refuses, so the caller can say so. */
  logoutAll: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

/** Tells this site's other tabs about logins and logouts ("login" | "logout"). */
const TABS_CHANNEL = "dulhaniyaa.auth";
/** Where the old long-lived token was kept before sessions moved to a cookie. Removed on load. */
const OLD_TOKEN_KEY = "dulhaniyaa.photos.token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<api.User | null>(null);
  const [loading, setLoading] = useState(api.isPhotosApiEnabled);
  const [signedOut, setSignedOut] = useState(false);
  const tabs = useRef<BroadcastChannel | null>(null);

  // Restore the session once from the refresh cookie (a 401 means logged out),
  // and follow logins/logouts made in other tabs.
  useEffect(() => {
    if (!api.isPhotosApiEnabled) return;
    let cancelled = false;

    try {
      window.localStorage.removeItem(OLD_TOKEN_KEY);
    } catch {
      // Storage blocked: nothing was saved there either.
    }

    async function restore() {
      try {
        const token = await api.refreshSession();
        const me = token ? await api.getMe({ quiet401: true }) : null;
        if (!cancelled) setUser(me);
      } catch {
        // Server unreachable: carry on logged out.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(TABS_CHANNEL);
    channel?.addEventListener("message", (e: MessageEvent) => {
      if (e.data === "login") void restore();
      if (e.data === "logout") {
        api.clearSession();
        setUser(null);
        setSignedOut(true);
      }
    });
    tabs.current = channel;

    void restore();
    return () => {
      cancelled = true;
      channel?.close();
      tabs.current = null;
    };
  }, []);

  // Refresh about a minute before the access token expires, while this tab is visible.
  // A hidden tab catches up as soon as it is shown again (or on its next 401).
  useEffect(() => {
    if (!api.isPhotosApiEnabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      clearTimeout(timer);
      const due = api.refreshDueAt();
      if (due === null || document.visibilityState !== "visible") return;
      timer = setTimeout(() => {
        api.refreshSession().then(
          (token) => {
            if (!token) setUser(null);
          },
          () => {
            // Network or rate limit: the next signed-in request refreshes on its 401 instead.
          },
        );
      }, refreshDelay(due, Date.now()));
    };

    const unsubscribe = api.onSessionChange(schedule);
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      clearTimeout(timer);
      unsubscribe();
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);

  // A 401 on any signed-in call ends the session and, unless told otherwise, goes to /login.
  useEffect(() => {
    if (!api.isPhotosApiEnabled) return;
    api.setUnauthorizedHandler((redirect) => {
      setUser(null);
      if (redirect) router.replace(loginHref(window.location.pathname + window.location.search));
    });
    return () => api.setUnauthorizedHandler(null);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    await api.login(email.trim(), password);
    try {
      const me = await api.getMe({ quiet401: true });
      setUser(me);
      setSignedOut(false);
      tabs.current?.postMessage("login");
    } catch (err) {
      api.clearSession();
      throw err;
    }
  }, []);

  const register = useCallback(
    async ({ name, email, password, phone }: RegisterInput) => {
      const cleanPhone = phone ? normalizePhone(phone) : "";
      await api.signup({ name: name.trim(), email: email.trim(), password, ...(cleanPhone && { phone: cleanPhone }) });
      // Signing up returns no token, so log straight in.
      await login(email, password);
    },
    [login],
  );

  // The access token is already forgotten by the API call; this clears the rest and goes home.
  const endSessionHere = useCallback(() => {
    setUser(null);
    setSignedOut(true);
    tabs.current?.postMessage("logout");
    router.replace("/");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Server unreachable: this tab is logged out, but the cookie may restore the session on reload.
    }
    endSessionHere();
  }, [endSessionHere]);

  const logoutAll = useCallback(async () => {
    await api.logoutAll();
    endSessionHere();
  }, [endSessionHere]);

  const value = useMemo(
    () => ({ user, loading, signedOut, login, register, logout, logoutAll }),
    [user, loading, signedOut, login, register, logout, logoutAll],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const noSubscribe = () => () => {};

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  // While a component hydrates, give it what the server rendered: the session still loading.
  // Parts of the page inside <Suspense> (like the header) hydrate later, and the saved session
  // may already be restored by then; without this their HTML wouldn't match the server's.
  // Right after hydrating, React re-renders them with the real session.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  return useMemo(
    () => (hydrated ? value : { ...value, user: null, loading: api.isPhotosApiEnabled, signedOut: false }),
    [hydrated, value],
  );
}
