import { describe, expect, it } from "vitest";
import { errorFromResponse, friendlyMessage, NETWORK_MESSAGE, PhotosApiError } from "./photosApiErrors";

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
