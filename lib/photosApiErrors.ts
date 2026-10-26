/**
 * Error handling for the photos API, kept free of browser APIs so it can be unit tested.
 */

export const NETWORK_MESSAGE = "Can't reach the server. Is the photos backend running?";

/** Every failed photos-API call throws this. `status` is 0 when the server couldn't be reached. */
export class PhotosApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PhotosApiError";
    this.status = status;
  }
}

function fallbackMessage(status: number) {
  if (status === 0) return NETWORK_MESSAGE;
  if (status === 400) return "Please check the details and try again.";
  if (status === 401) return "Please log in again.";
  if (status === 404) return "We couldn't find that.";
  if (status === 413) return "That file is too large.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return "Something went wrong. Please try again.";
}

/** Turns a failed response into a PhotosApiError, using the server's `{ error }` text when there is one. */
export function errorFromResponse(status: number, body: unknown): PhotosApiError {
  const serverMessage =
    body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error.trim() : "";
  return new PhotosApiError(status, serverMessage || fallbackMessage(status));
}

/** Only public photos get share links. Shown on a private photo's share button and for the backend's 400. */
export const MAKE_PUBLIC_MESSAGE = "Make this photo public to share it";
export const EMAIL_NOT_FOUND_MESSAGE = "Email not found";
export const TOO_MANY_LOOKUPS_MESSAGE = "Too many lookups, try again later";

/**
 * "login" and "signup" for those forms. "members" for sharing a collection with people (lookup, add,
 * list, remove). "sharePhoto" for making a photo's share link. "forgotPassword" for asking for a reset
 * code and "resetPassword" for setting the new password with it.
 */
type ErrorContext = "login" | "signup" | "members" | "sharePhoto" | "forgotPassword" | "resetPassword" | "default";

export const TOO_MANY_CODES_MESSAGE = "Too many code requests from here. Please wait a while and try again.";
export const TOO_MANY_RESET_ATTEMPTS_MESSAGE = "Too many attempts. Please wait a few minutes and try again.";

/** The reset-password 400 for a wrong, expired, used-up or never-sent code. */
export const isInvalidResetCode = (err: unknown) =>
  err instanceof PhotosApiError && err.status === 400 && /invalid or expired code/i.test(err.message);

/** Finding, adding and removing people. The lookup and add calls have their own rate limit. */
function membersMessage({ status, message }: PhotosApiError): string | null {
  if (status === 404) return /email not found/i.test(message) ? EMAIL_NOT_FOUND_MESSAGE : "This collection isn't available any more.";
  if (status === 429) return TOO_MANY_LOOKUPS_MESSAGE;
  if (status === 400 && /yourself/i.test(message)) return "That's your own email. You already have access as the owner.";
  if (status === 400 && /email/i.test(message)) return "Enter a valid email address";
  if (status === 401) return "Please log in again.";
  return null;
}

/** The message to show a visitor for any error thrown while talking to the photos API. */
export function friendlyMessage(err: unknown, context: ErrorContext = "default"): string {
  if (!(err instanceof PhotosApiError)) return "Something went wrong. Please try again.";
  if (err.status === 0) return NETWORK_MESSAGE;
  if (context === "login" && err.status === 401) return "Wrong email or password.";
  if (context === "signup" && err.status === 409) return "An account with this email already exists. Log in instead.";
  if (context === "members") {
    const message = membersMessage(err);
    if (message) return message;
  }
  // Their 400s ("The code must be 6 digits", "Invalid or expired code"...) are already worded for people.
  if (context === "forgotPassword" || context === "resetPassword") {
    if (err.status === 429) return context === "forgotPassword" ? TOO_MANY_CODES_MESSAGE : TOO_MANY_RESET_ATTEMPTS_MESSAGE;
    return err.message;
  }
  // "Only public photos can be shared. Make it public first"
  if (context === "sharePhoto" && err.status === 400 && /public/i.test(err.message)) return MAKE_PUBLIC_MESSAGE;
  return toCollectionWording(err.message);
}

/** The API calls them buckets; the site calls them collections. */
export const toCollectionWording = (message: string) =>
  message.replace(/\b(b)ucket(s?)\b/gi, (_, b: string, s: string) => `${b === "B" ? "C" : "c"}ollection${s}`);
