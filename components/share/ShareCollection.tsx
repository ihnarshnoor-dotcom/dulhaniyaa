"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/auth/AuthProvider";
import { errorId, inputClass } from "@/components/auth/Field";
import { buttonClasses } from "@/components/ui/Button";
import { CheckIcon, CloseIcon, CopyIcon, ShareIcon } from "@/components/ui/Icons";
import {
  collectionLink,
  emailedNote,
  initialOf,
  memberEmailSchema,
  privateShareNote,
  withMember,
  withoutMember,
  type Member,
  type MemberEmailValues,
  type Person,
} from "@/lib/collections";
import { addMember, EMAIL_NOT_FOUND_MESSAGE, friendlyMessage, listMembers, lookupMember, removeMember, type Bucket } from "@/lib/photosApi";

/** How many of the loaded photos are private. `more` is true while not every photo has loaded. */
export type PrivatePhotos = { count: number; more: boolean };

type Props = {
  bucket: Bucket;
  /** Shown as "N private photos won't be visible…". Leave it out when the count isn't known. */
  privatePhotos?: PrivatePhotos | null;
  className?: string;
};

/**
 * "Share collection" button and dialog, for the collection's owner. Collections are private: the owner
 * adds people by their exact email, and only they can open the link, after logging in.
 */
export function ShareCollection({ bucket, privatePhotos, className = "" }: Props) {
  const { loading } = useAuth();
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  // Open as a modal once `open` is set, with the email field focused. (Guarded: in development React
  // runs this twice, and opening an open dialog throws.)
  useEffect(() => {
    const el = dialog.current;
    if (!open || !el || el.open) return;
    el.showModal();
    el.querySelector<HTMLInputElement>("input[type=email]")?.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className={`inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-secondary-dark disabled:opacity-60 ${className}`}
      >
        <ShareIcon width={18} height={18} />
        Share collection
      </button>

      {/* A modal <dialog> keeps focus inside it and closes on Esc. */}
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        className="m-auto max-h-[calc(100svh-2rem)] w-[min(30rem,calc(100vw-2rem))] overflow-y-auto rounded-3xl bg-ivory p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        {/* Mounted only while open, so every opening starts fresh and reloads the list. */}
        {open && (
          <SharePanel bucket={bucket} privatePhotos={privatePhotos} titleId={titleId} onClose={() => dialog.current?.close()} />
        )}
      </dialog>
    </>
  );
}

function SharePanel({
  bucket,
  privatePhotos,
  titleId,
  onClose,
}: {
  bucket: Bucket;
  privatePhotos?: PrivatePhotos | null;
  titleId: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const id = useId();
  const emailId = `${id}-email`;
  const peopleHeading = useRef<HTMLHeadingElement>(null);

  const [members, setMembers] = useState<Member[] | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [found, setFound] = useState<Person | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  // "We've sent them an email", under the rows of people just added, by user id.
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Read out by screen readers: "Shared with …", "Link copied", and so on.
  const [announcement, setAnnouncement] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberEmailValues>({ resolver: zodResolver(memberEmailSchema), defaultValues: { email: "" } });

  useEffect(() => {
    const controller = new AbortController();
    listMembers(bucket.id, controller.signal)
      .then((list) => {
        setMembers(list);
        setMembersError(null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setMembersError(friendlyMessage(err, "members"));
      });
    return () => controller.abort();
  }, [bucket.id, reloadKey]);

  // Only an explicit Find (button or Enter) looks an email up, never typing: the lookup must not be usable to browse accounts.
  async function find({ email }: MemberEmailValues) {
    setFound(null);
    setAddError(null);
    try {
      const result = await lookupMember(bucket.id, email);
      if (result.found) setFound(result.person);
      else setError("email", { message: EMAIL_NOT_FOUND_MESSAGE });
    } catch (err) {
      setError("email", { message: friendlyMessage(err, "members") });
    }
  }

  async function share(person: Person) {
    setAdding(true);
    setAddError(null);
    try {
      const added = await addMember(bucket.id, person.email);
      const member = added.member ?? { ...person, addedAt: null };
      const note = emailedNote(added.emailed);
      setMembers((list) => list && withMember(list, member));
      setNotes((current) => {
        const next = { ...current };
        if (note) next[member.userId] = note;
        else delete next[member.userId];
        return next;
      });
      setFound(null);
      reset({ email: "" });
      setAnnouncement(note ? `Shared with ${member.name}. ${note}.` : `Shared with ${member.name}.`);
      setFocus("email");
    } catch (err) {
      setAddError(friendlyMessage(err, "members"));
    } finally {
      setAdding(false);
    }
  }

  async function remove(member: Member) {
    setRemovingId(member.userId);
    setRemoveError(null);
    try {
      await removeMember(bucket.id, member.userId);
      setMembers((list) => list && withoutMember(list, member.userId));
      setConfirmingId(null);
      setAnnouncement(`${member.name} no longer has access.`);
      // Their row (and the focused button in it) is gone: put focus somewhere sensible.
      peopleHeading.current?.focus();
    } catch (err) {
      setRemoveError(friendlyMessage(err, "members"));
    } finally {
      setRemovingId(null);
    }
  }

  function cancelRemove(userId: string) {
    setConfirmingId(null);
    requestAnimationFrame(() => document.getElementById(`${id}-remove-${userId}`)?.focus());
  }

  const emailError = errors.email?.message;
  const isSelf = found !== null && found.userId === user?.id;
  const alreadyShared = found !== null && (members?.some((m) => m.userId === found.userId) ?? false);
  const note = privatePhotos ? privateShareNote(privatePhotos.count, privatePhotos.more) : null;

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="min-w-0 text-3xl break-words">
          Share &ldquo;{bucket.name}&rdquo;
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-secondary/60"
        >
          <CloseIcon width={20} height={20} />
        </button>
      </div>

      {/* Add people */}
      <form onSubmit={handleSubmit(find)} noValidate className="mt-5">
        <label htmlFor={emailId} className="mb-2 block text-sm font-medium text-ink">
          Add people by email
        </label>
        <div className="flex gap-2">
          <input
            id={emailId}
            type="email"
            inputMode="email"
            // Never suggest addresses: only what the owner types in full is looked up.
            autoComplete="off"
            placeholder="name@example.com"
            className={inputClass}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? errorId(emailId) : undefined}
            {...register("email", { onChange: () => setFound(null) })}
          />
          <button type="submit" disabled={isSubmitting} className={buttonClasses("primary", "shrink-0 px-5 disabled:opacity-60")}>
            {isSubmitting ? "Finding…" : "Find"}
          </button>
        </div>
        {emailError && (
          <p id={errorId(emailId)} role="alert" className="mt-1.5 text-sm text-red-700">
            {emailError}
          </p>
        )}
      </form>

      <div aria-live="polite">
        {found && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-ink/15 bg-white/60 p-3">
            <Avatar name={found.name} email={found.email} />
            <PersonText name={found.name} email={found.email} />
            {isSelf ? (
              <span className="shrink-0 text-xs text-muted">That&apos;s you</span>
            ) : alreadyShared ? (
              <span className="shrink-0 text-xs text-muted">Already has access</span>
            ) : (
              <button
                type="button"
                onClick={() => share(found)}
                disabled={adding}
                aria-label={`Share with ${found.name}`}
                className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
              >
                {adding ? "Sharing…" : "Share"}
              </button>
            )}
          </div>
        )}
        {addError && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {addError}
          </p>
        )}
      </div>

      {/* People with access */}
      <h3 ref={peopleHeading} tabIndex={-1} className="mt-7 text-sm font-medium focus:outline-none">
        People with access
      </h3>
      <div className="mt-2" aria-busy={members === null && !membersError}>
        {user && (
          <div className="flex min-h-14 items-center gap-3 py-2">
            <Avatar name={user.name} email={user.email} />
            <PersonText name={`${user.name} (You)`} email={user.email} />
            <span className="shrink-0 text-xs text-muted">Owner</span>
          </div>
        )}

        {membersError && (
          <div role="alert" className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {membersError}{" "}
            <button
              type="button"
              onClick={() => {
                setMembersError(null);
                setReloadKey((k) => k + 1);
              }}
              className="font-semibold text-primary underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {!membersError && members === null && (
          <div role="status" aria-label="Loading people with access" className="space-y-2 py-2">
            <div className="shimmer h-10 rounded-xl" />
            <div className="shimmer h-10 rounded-xl" />
          </div>
        )}

        {members && members.length === 0 && <p className="py-2 text-sm text-muted">Not shared with anyone yet.</p>}

        {members && members.length > 0 && (
          <ul className="max-h-72 overflow-y-auto">
            {members.map((member) => (
              <li key={member.userId} className="py-2">
                <div className="flex min-h-10 items-center gap-3">
                  <Avatar name={member.name} email={member.email} />
                  <PersonText name={member.name} email={member.email} />
                  {confirmingId === member.userId ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => remove(member)}
                        disabled={removingId !== null}
                        autoFocus
                        aria-label={`Remove ${member.name}'s access`}
                        className="inline-flex min-h-9 items-center rounded-full bg-red-700 px-3 text-xs font-medium text-white transition-colors hover:bg-red-800 disabled:opacity-60"
                      >
                        {removingId === member.userId ? "Removing…" : "Remove"}
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelRemove(member.userId)}
                        disabled={removingId !== null}
                        className="inline-flex min-h-9 items-center rounded-full px-3 text-xs font-medium text-ink transition-colors hover:bg-secondary/60 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id={`${id}-remove-${member.userId}`}
                      onClick={() => {
                        setRemoveError(null);
                        setConfirmingId(member.userId);
                      }}
                      disabled={removingId !== null}
                      aria-label={`Remove ${member.name}`}
                      title="Remove access"
                      className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-secondary/60 hover:text-primary disabled:opacity-40"
                    >
                      <CloseIcon width={16} height={16} />
                    </button>
                  )}
                </div>
                {/* Lined up with the name: avatar (2.5rem) + gap (0.75rem). */}
                {notes[member.userId] && <p className="mt-1 pl-13 text-xs text-muted">{notes[member.userId]}</p>}
              </li>
            ))}
          </ul>
        )}

        {removeError && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {removeError}
          </p>
        )}
      </div>

      {note && <p className="mt-5 rounded-lg bg-secondary/40 p-3 text-sm leading-relaxed text-ink">{note}</p>}

      <CopyLink bucketId={bucket.id} onCopied={() => setAnnouncement("Link copied.")} />

      <div className="mt-6 flex justify-end border-t border-ink/10 pt-4">
        <button type="button" onClick={onClose} className={buttonClasses("primary", "min-h-11 px-6")}>
          Done
        </button>
      </div>

      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}

/** "Copy link": the collection page, which only people with access can open. */
function CopyLink({ bucketId, onCopied }: { bucketId: string; onCopied: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showLink, setShowLink] = useState(false);
  // Safe to read in render: this panel only appears after a click, so it never renders on the server.
  const link = collectionLink(window.location.origin, bucketId);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard blocked: show the link so it can be copied by hand.
      setShowLink(true);
      return;
    }
    setCopied(true);
    onCopied();
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-5 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
      >
        {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
        {copied ? "Copied" : "Copy link"}
      </button>
      {showLink && (
        <input
          readOnly
          value={link}
          aria-label="Link to this collection"
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          className="mt-3 block min-h-11 w-full rounded-full border border-ink/15 bg-white/60 px-4 text-sm text-ink focus:border-primary focus:outline-none"
        />
      )}
      <p className="mt-2 text-xs leading-relaxed text-muted">Only people you add can open this link, and they have to log in.</p>
    </div>
  );
}

function Avatar({ name, email }: { name: string; email: string }) {
  return (
    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">
      {initialOf(name, email)}
    </span>
  );
}

function PersonText({ name, email }: { name: string; email: string }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium">{name}</span>
      <span className="block truncate text-xs text-muted">{email}</span>
    </span>
  );
}
