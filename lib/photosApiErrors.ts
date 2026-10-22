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

type ErrorContext = "login" | "signup" | "default";

/** The message to show a visitor for any error thrown while talking to the photos API. */
export function friendlyMessage(err: unknown, context: ErrorContext = "default"): string {
  if (!(err instanceof PhotosApiError)) return "Something went wrong. Please try again.";
  if (err.status === 0) return NETWORK_MESSAGE;
  if (context === "login" && err.status === 401) return "Wrong email or password.";
  if (context === "signup" && err.status === 409) return "An account with this email already exists. Log in instead.";
  return toCollectionWording(err.message);
}

/** The API calls them buckets; the site calls them collections. */
export const toCollectionWording = (message: string) =>
  message.replace(/\b(b)ucket(s?)\b/gi, (_, b: string, s: string) => `${b === "B" ? "C" : "c"}ollection${s}`);
