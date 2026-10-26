import { describe, expect, it } from "vitest";
import {
  EMAIL_NOT_FOUND_MESSAGE,
  errorFromResponse,
  friendlyMessage,
  isInvalidResetCode,
  MAKE_PUBLIC_MESSAGE,
  NETWORK_MESSAGE,
  PhotosApiError,
  TOO_MANY_CODES_MESSAGE,
  TOO_MANY_LOOKUPS_MESSAGE,
  TOO_MANY_RESET_ATTEMPTS_MESSAGE,
} from "./photosApiErrors";

describe("errorFromResponse", () => {
  it("uses the server's error text", () => {
    const err = errorFromResponse(400, { error: "At least one tag is required" });
    expect(err).toBeInstanceOf(PhotosApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe("At least one tag is required");
  });

  it.each([
    [400, null, "Please check the details and try again."],
    [401, {}, "Please log in again."],
    [404, { error: "" }, "We couldn't find that."],
    [413, "Payload Too Large", "That file is too large."],
    [429, { error: "" }, "Too many requests. Please wait a moment and try again."],
    [500, { error: 42 }, "Something went wrong on our side. Please try again."],
    [418, undefined, "Something went wrong. Please try again."],
  ])("falls back to a readable message for %i with body %j", (status, body, message) => {
    expect(errorFromResponse(status, body).message).toBe(message);
  });
});

describe("friendlyMessage", () => {
  it("maps a failed login to one message for wrong email or password", () => {
    const err = errorFromResponse(401, { error: "Invalid email or password" });
    expect(friendlyMessage(err, "login")).toBe("Wrong email or password.");
  });

  it("maps an email already in use on sign-up", () => {
    const err = errorFromResponse(409, { error: "An account with this email already exists" });
    expect(friendlyMessage(err, "signup")).toBe("An account with this email already exists. Log in instead.");
  });

  it("shows the network message when the server can't be reached", () => {
    expect(friendlyMessage(new PhotosApiError(0, "anything"), "login")).toBe(NETWORK_MESSAGE);
    expect(NETWORK_MESSAGE).toBe("Can't reach the server. Is the photos backend running?");
  });

  it("passes other server messages through", () => {
    const err = errorFromResponse(400, { error: "Phone must be 10 to 15 digits, optionally starting with +" });
    expect(friendlyMessage(err, "signup")).toBe("Phone must be 10 to 15 digits, optionally starting with +");
    expect(friendlyMessage(errorFromResponse(401, null))).toBe("Please log in again.");
  });

  it("handles errors that didn't come from the API", () => {
    expect(friendlyMessage(new Error("boom"))).toBe("Something went wrong. Please try again.");
    expect(friendlyMessage("nope")).toBe("Something went wrong. Please try again.");
  });
});

describe("collection wording", () => {
  it("says collection instead of bucket in server messages", () => {
    expect(friendlyMessage(errorFromResponse(409, { error: "You already have a bucket with this name" }))).toBe(
      "You already have a collection with this name",
    );
    expect(friendlyMessage(errorFromResponse(400, { error: "Bucket name is required" }))).toBe("Collection name is required");
    expect(friendlyMessage(errorFromResponse(400, { error: "bucketId must be a valid id" }))).toBe("bucketId must be a valid id");
  });
});

describe("sharing a collection with people", () => {
  const members = (status: number, body: unknown) => friendlyMessage(errorFromResponse(status, body), "members");

  it("says the email wasn't found", () => {
    expect(members(404, { error: "Email not found" })).toBe(EMAIL_NOT_FOUND_MESSAGE);
    expect(EMAIL_NOT_FOUND_MESSAGE).toBe("Email not found");
  });

  it("doesn't call a missing collection a missing email", () => {
    expect(members(404, { error: "Not found" })).toBe("This collection isn't available any more.");
    expect(members(404, null)).toBe("This collection isn't available any more.");
  });

  it("asks to wait after too many lookups or adds", () => {
    expect(members(429, { error: "Too many email lookups, please try again later" })).toBe(TOO_MANY_LOOKUPS_MESSAGE);
    expect(members(429, { error: "Too many people added, please try again later" })).toBe(TOO_MANY_LOOKUPS_MESSAGE);
    expect(TOO_MANY_LOOKUPS_MESSAGE).toBe("Too many lookups, try again later");
  });

  it("explains adding yourself and a bad email", () => {
    expect(members(400, { error: "You can't add yourself to your own collection" })).toBe(
      "That's your own email. You already have access as the owner.",
    );
    expect(members(400, { error: "A valid email is required" })).toBe("Enter a valid email address");
  });

  it("asks to log in again on a 401", () => {
    expect(members(401, { error: "Not logged in" })).toBe("Please log in again.");
  });

  it("passes the member limit through, in collection wording", () => {
    expect(members(409, { error: "A collection can have at most 50 members" })).toBe("A collection can have at most 50 members");
  });

  it("still shows the network message", () => {
    expect(friendlyMessage(new PhotosApiError(0, "x"), "members")).toBe(NETWORK_MESSAGE);
  });
});

describe("sharing a photo", () => {
  it("asks to make a private photo public", () => {
    const err = errorFromResponse(400, { error: "Only public photos can be shared. Make it public first" });
    expect(friendlyMessage(err, "sharePhoto")).toBe(MAKE_PUBLIC_MESSAGE);
    expect(MAKE_PUBLIC_MESSAGE).toBe("Make this photo public to share it");
  });

  it("leaves other errors alone", () => {
    expect(friendlyMessage(errorFromResponse(404, { error: "Image not found" }), "sharePhoto")).toBe("Image not found");
    expect(friendlyMessage(errorFromResponse(400, { error: "expiresAt must be in the future" }), "sharePhoto")).toBe(
      "expiresAt must be in the future",
    );
  });
});

describe("forgot and reset password", () => {
  it.each([
    "A valid email is required",
    "The code must be 6 digits",
    "Password must be at least 8 characters",
    "Password must be at most 72 bytes",
    "Passwords do not match",
    "Invalid or expired code",
  ])("shows the 400 %j as it is", (error) => {
    expect(friendlyMessage(errorFromResponse(400, { error }), "resetPassword")).toBe(error);
    expect(friendlyMessage(errorFromResponse(400, { error }), "forgotPassword")).toBe(error);
  });

  it("asks to wait on a 429, whatever the server said", () => {
    const err = errorFromResponse(429, { error: "Too many password reset requests, please try again later" });
    expect(friendlyMessage(err, "forgotPassword")).toBe(TOO_MANY_CODES_MESSAGE);
    expect(friendlyMessage(errorFromResponse(429, null), "resetPassword")).toBe(TOO_MANY_RESET_ATTEMPTS_MESSAGE);
  });

  it("shows the network message when the server can't be reached", () => {
    expect(friendlyMessage(new PhotosApiError(0, "x"), "forgotPassword")).toBe(NETWORK_MESSAGE);
    expect(friendlyMessage(new PhotosApiError(0, "x"), "resetPassword")).toBe(NETWORK_MESSAGE);
    expect(friendlyMessage(new TypeError("Failed to fetch"), "resetPassword")).toBe("Something went wrong. Please try again.");
  });

  it("recognises the bad-code 400 only", () => {
    expect(isInvalidResetCode(errorFromResponse(400, { error: "Invalid or expired code" }))).toBe(true);
    expect(isInvalidResetCode(errorFromResponse(400, { error: "The code must be 6 digits" }))).toBe(false);
    expect(isInvalidResetCode(errorFromResponse(429, { error: "Invalid or expired code" }))).toBe(false);
    expect(isInvalidResetCode(new Error("Invalid or expired code"))).toBe(false);
  });
});
