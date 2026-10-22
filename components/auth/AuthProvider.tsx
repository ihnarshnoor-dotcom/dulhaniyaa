"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearToken, getToken, setToken, TOKEN_KEY } from "@/lib/authStorage";
import * as api from "@/lib/photosApi";
import { normalizePhone } from "@/lib/authSchemas";
import { loginHref } from "@/lib/safeNext";

type RegisterInput = { name: string; email: string; password: string; phone?: string };

type AuthValue = {
  user: api.User | null;
  /** True while a saved session is being restored. */
  loading: boolean;
  /** True after the visitor logged out on purpose (protected pages then go home, not to /login). */
  signedOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<api.User | null>(null);
  const [loading, setLoading] = useState(api.isPhotosApiEnabled);
  const [signedOut, setSignedOut] = useState(false);

  // Restore a saved session once, and follow logins/logouts made in other tabs.
  useEffect(() => {
    if (!api.isPhotosApiEnabled) return;
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      try {
        const me = await api.getMe({ quiet401: true });
        if (!cancelled) setUser(me);
      } catch {
        // Expired token (already cleared) or server unreachable: carry on logged out.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === null) void restore();
    };

    void restore();
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
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
    const { token } = await api.login(email.trim(), password);
    setToken(token);
    try {
      const me = await api.getMe({ quiet401: true });
      setUser(me);
      setSignedOut(false);
    } catch (err) {
      clearToken();
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

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setSignedOut(true);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signedOut, login, register, logout }),
    [user, loading, signedOut, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
