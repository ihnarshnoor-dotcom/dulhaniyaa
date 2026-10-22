"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserIcon } from "@/components/ui/Icons";
import { isPhotosApiEnabled } from "@/lib/photosApi";

/** Round account button: "Log in" link, or the signed-in account menu. Renders nothing when the photos API is off. */
export function HeaderAuth() {
  if (!isPhotosApiEnabled) return null;
  return <AuthControl />;
}

function AuthControl() {
  const { user, loading } = useAuth();

  // Same size as the account button, so the header doesn't jump while the session loads.
  if (loading) return <div aria-hidden className="shimmer size-10 shrink-0 rounded-full max-sm:hidden" />;

  if (!user) {
    return (
      <Link
        href="/login"
        aria-label="Log in"
        title="Log in"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary transition-colors hover:bg-secondary-dark max-sm:hidden"
      >
        <UserIcon />
      </Link>
    );
  }
  return <AccountMenu name={user.name} />;
}

function AccountMenu({ name }: { name: string }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = () => [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
  const focusItem = (index: number) => {
    const list = items();
    list[(index + list.length) % list.length]?.focus();
  };

  // Close on a click outside or on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openAndFocus(index: number) {
    setOpen(true);
    requestAnimationFrame(() => focusItem(index));
  }

  function onButtonKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openAndFocus(0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openAndFocus(-1);
    }
  }

  function onMenuKey(e: KeyboardEvent<HTMLDivElement>) {
    const list = items();
    const current = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") focusItem(current + 1);
    else if (e.key === "ArrowUp") focusItem(current - 1);
    else if (e.key === "Home") focusItem(0);
    else if (e.key === "End") focusItem(-1);
    else if (e.key === "Tab") setOpen(false);
    else return;
    if (e.key !== "Tab") e.preventDefault();
  }

  const itemClass = "block w-full px-4 py-2.5 text-left text-sm text-ink transition-colors hover:bg-secondary/50 focus:bg-secondary/50 focus:outline-none";

  return (
    <div ref={wrapper} className="relative max-sm:hidden">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${name}`}
        title={`Signed in as ${name}`}
        className={`grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark ${open ? "ring-4 ring-primary/20" : ""}`}
      >
        <UserIcon />
      </button>

      <div
        ref={menu}
        id={menuId}
        role="menu"
        aria-label="Account"
        hidden={!open}
        onKeyDown={onMenuKey}
        className="absolute top-full right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-ink/10 bg-ivory py-1.5 shadow-xl shadow-ink/10"
      >
        <p className="truncate border-b border-ink/10 px-4 pt-1 pb-2.5 text-xs text-muted">Signed in as {name}</p>
        <Link href="/account" role="menuitem" tabIndex={-1} onNavigate={() => setOpen(false)} className={itemClass}>
          My account
        </Link>
        <Link href="/account/saved" role="menuitem" tabIndex={-1} onNavigate={() => setOpen(false)} className={itemClass}>
          Saved photos
        </Link>
        <Link href="/account/upload" role="menuitem" tabIndex={-1} onNavigate={() => setOpen(false)} className={itemClass}>
          Upload a photo
        </Link>
        <button
          type="button"
          role="menuitem"
          tabIndex={-1}
          onClick={() => {
            setOpen(false);
            logout();
          }}
          className={`${itemClass} border-t border-ink/10 text-primary`}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
