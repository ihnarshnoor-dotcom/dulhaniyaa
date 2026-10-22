"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CheckIcon, CloseIcon, CopyIcon, ShareIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { createPhotoShare, friendlyMessage, photoAlt, revokeShare, type ApiPhoto } from "@/lib/photosApi";
import { loginHref } from "@/lib/safeNext";
import { SHARE_DAYS, shareLink } from "@/lib/share";

type Link = { token: string; url: string };
type State =
  | { step: "idle" }
  | { step: "creating" }
  | { step: "ready"; link: Link }
  | { step: "revoking"; link: Link }
  | { step: "revoked" };

/**
 * "Share" button that opens a dialog for making a 3-day link to one photo, with copy, WhatsApp,
 * the phone's share sheet and a QR code. Only public photos can be shared: on a private one the
 * button is disabled. Logged-out visitors are sent to /login and brought back afterwards.
 */
export function SharePhoto({
  photo,
  variant = "icon",
  className = "",
}: {
  photo: ApiPhoto;
  /** "icon": small round button for photo cards. "labelled": pill with text, for the full-screen preview. */
  variant?: "icon" | "labelled";
  className?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ step: "idle" });
  const [error, setError] = useState<string | null>(null);
  const isPublic = photo.visibility === "public";

  function openDialog() {
    if (!user) {
      router.push(loginHref(window.location.pathname + window.location.search));
      return;
    }
    setError(null);
    // A link made earlier is shown again rather than making a new one.
    if (state.step === "revoked") setState({ step: "idle" });
    setOpen(true);
    dialog.current?.showModal();
  }

  async function create() {
    setError(null);
    setState({ step: "creating" });
    try {
      const { token } = await createPhotoShare(photo.id);
      setState({ step: "ready", link: { token, url: shareLink(window.location.origin, token) } });
    } catch (err) {
      setState({ step: "idle" });
      setError(friendlyMessage(err));
    }
  }

  async function revoke(link: Link) {
    setError(null);
    setState({ step: "revoking", link });
    try {
      await revokeShare(link.token);
      setState({ step: "revoked" });
    } catch (err) {
      setState({ step: "ready", link });
      setError(friendlyMessage(err));
    }
  }

  const label = isPublic ? `Share "${photoAlt(photo)}"` : "Make this photo public to share it";

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={openDialog}
          disabled={loading || !isPublic}
          aria-label={label}
          title={isPublic ? "Share photo" : "Make it public to share"}
          className={`grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-secondary/60 hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted ${className}`}
        >
          <ShareIcon width={16} height={16} />
        </button>
      ) : (
        isPublic && (
          <button
            type="button"
            onClick={openDialog}
            disabled={loading}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium whitespace-nowrap text-ink shadow-xl transition hover:bg-primary hover:text-white disabled:opacity-60 ${className}`}
          >
            <ShareIcon width={18} height={18} />
            Share
          </button>
        )
      )}

      <dialog
        ref={dialog}
        aria-labelledby={`share-title-${photo.id}`}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl bg-ivory p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <h2 id={`share-title-${photo.id}`} className="text-3xl">
                Share photo
              </h2>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Close"
                className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-secondary/60"
              >
                <CloseIcon width={20} height={20} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-secondary/40">
                <Image src={photo.thumb_url ?? photo.url} alt="" fill unoptimized sizes="56px" className="object-cover" />
              </div>
              <p className="line-clamp-2 text-sm text-muted">{photoAlt(photo)}</p>
            </div>

            <div className="mt-6" aria-live="polite">
              {(state.step === "idle" || state.step === "creating") && (
                <>
                  <p className="text-sm leading-relaxed text-muted">
                    Anyone with the link can see this photo, without logging in. The link stops working after {SHARE_DAYS} days.
                  </p>
                  <button
                    type="button"
                    onClick={create}
                    disabled={state.step === "creating"}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
                  >
                    {state.step === "creating" ? "Creating link…" : "Create link"}
                  </button>
                </>
              )}

              {(state.step === "ready" || state.step === "revoking") && (
                <LinkPanel link={state.link} revoking={state.step === "revoking"} onRevoke={() => revoke(state.link)} />
              )}

              {state.step === "revoked" && (
                <p className="rounded-lg bg-secondary/40 p-3 text-sm text-ink">
                  Sharing stopped. The link and QR code no longer open this photo.
                </p>
              )}

              {error && (
                <p role="alert" className="mt-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

/** The created link: copy, send, QR code, and "Stop sharing". */
function LinkPanel({ link, revoking, onRevoke }: { link: Link; revoking: boolean; onRevoke: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState<string | null>(null);

  // The QR library is only needed here, so it loads when the first link is made.
  useEffect(() => {
    let cancelled = false;
    import("qrcode")
      .then(({ default: QRCode }) => QRCode.toDataURL(link.url, { width: 480, margin: 1, color: { dark: "#2b1d1a", light: "#ffffff" } }))
      .then((dataUrl) => {
        if (!cancelled) setQr(dataUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [link.url]);

  // Safe to read in render: this panel only appears after a click, so it never renders on the server.
  const canShare = typeof navigator.share === "function";

  async function copy() {
    try {
      await navigator.clipboard.writeText(link.url);
    } catch {
      // Clipboard blocked: select the text so it can be copied by hand.
      input.current?.select();
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const message = `Look at this photo on Dulhaniyaa: ${link.url}`;
  const pill =
    "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary";

  return (
    <div>
      <label htmlFor={`share-link-${link.token}`} className="text-sm font-medium">
        Link
      </label>
      <div className="mt-2 flex gap-2">
        <input
          ref={input}
          id={`share-link-${link.token}`}
          readOnly
          value={link.url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-11 min-w-0 flex-1 rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={pill}>
          <WhatsAppIcon width={18} height={18} />
          WhatsApp
        </a>
        {canShare && (
          <button
            type="button"
            onClick={() => navigator.share({ title: "A photo from Dulhaniyaa", url: link.url }).catch(() => {})}
            className={pill}
          >
            <ShareIcon width={18} height={18} />
            More
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {qr ? (
          // A data: URL made in the browser, so next/image has nothing to optimise.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="QR code for the share link" width={192} height={192} className="size-48 rounded-2xl bg-white p-2 shadow-md" />
        ) : (
          <div role="status" aria-label="Making the QR code" className="shimmer size-48 rounded-2xl" />
        )}
        {qr && (
          <a href={qr} download="dulhaniyaa-photo-qr.png" className="text-sm font-medium text-primary underline underline-offset-4">
            Download QR code
          </a>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs text-muted">
        <span>Works for {SHARE_DAYS} days.</span>
        <button
          type="button"
          onClick={onRevoke}
          disabled={revoking}
          className="font-medium text-red-700 underline underline-offset-4 disabled:opacity-60"
        >
          {revoking ? "Stopping…" : "Stop sharing"}
        </button>
      </div>
    </div>
  );
}
