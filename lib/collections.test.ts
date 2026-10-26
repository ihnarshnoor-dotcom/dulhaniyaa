import { describe, expect, it } from "vitest";
import {
  addedMemberOf,
  collectionInfoOf,
  collectionLink,
  collectionLoginHref,
  collectionPath,
  countOf,
  emailedNote,
  hiddenPhotosNote,
  initialOf,
  lookupResultOf,
  memberEmailSchema,
  memberOf,
  membersOf,
  privateCount,
  privateShareNote,
  sharedCollectionsOf,
  withMember,
  withoutMember,
} from "./collections";
import { safeNextPath } from "./safeNext";

const id = "6f1c2a9e-0b7d-4c55-9a51-3f0e8d2b7c10";

describe("collection links", () => {
  it("points at this site's collection page", () => {
    expect(collectionPath(id)).toBe(`/collections/${id}`);
    expect(collectionLink("http://localhost:3000", id)).toBe(`http://localhost:3000/collections/${id}`);
  });

  it("drops a trailing slash on the origin", () => {
    expect(collectionLink("https://dulhaniyaa.com/", "b")).toBe("https://dulhaniyaa.com/collections/b");
  });

  it("encodes the id", () => {
    expect(collectionPath("a/b?c")).toBe("/collections/a%2Fb%3Fc");
  });

  it("logs in and comes back to the collection", () => {
    const href = collectionLoginHref(id);
    expect(href).toBe(`/login?next=%2Fcollections%2F${id}`);
    // What LoginForm and RegisterForm do with ?next after logging in.
    const next = new URL(href, "http://localhost").searchParams.get("next");
    expect(safeNextPath(next)).toBe(`/collections/${id}`);
  });

  it("keeps ?next through register -> login", () => {
    // RegisterForm links to /login?next=<safe next>, and LoginForm to /register?next=<safe next>.
    const next = safeNextPath(new URL(collectionLoginHref(id), "http://localhost").searchParams.get("next"));
    const loginFromRegister = `/login?next=${encodeURIComponent(next)}`;
    expect(safeNextPath(new URL(loginFromRegister, "http://localhost").searchParams.get("next"))).toBe(`/collections/${id}`);
  });
});

describe("memberEmailSchema", () => {
  it("accepts and trims a full email", () => {
    expect(memberEmailSchema.parse({ email: "  priya@example.com " }).email).toBe("priya@example.com");
  });

  it.each([
    ["", "Enter their email address"],
    ["   ", "Enter their email address"],
    ["priya", "Enter a valid email address"],
    ["priya@", "Enter a valid email address"],
    ["@example.com", "Enter a valid email address"],
  ])("rejects %j", (email, message) => {
    const result = memberEmailSchema.safeParse({ email });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});

describe("lookupResultOf", () => {
  it("reads a found account", () => {
    expect(lookupResultOf({ found: true, userId: "u1", name: " Asha ", email: "asha@example.com" })).toEqual({
      found: true,
      person: { userId: "u1", name: "Asha", email: "asha@example.com" },
    });
  });

  it("reads not found", () => {
    expect(lookupResultOf({ found: false })).toEqual({ found: false });
  });

  it("treats anything unreadable as not found", () => {
    expect(lookupResultOf(null)).toEqual({ found: false });
    expect(lookupResultOf({ found: true })).toEqual({ found: false });
    expect(lookupResultOf({ found: "yes", userId: "u1", email: "a@b.co" })).toEqual({ found: false });
  });
});

describe("members", () => {
  const asha = { userId: "u1", name: "Asha", email: "asha@example.com", addedAt: "2026-10-20T10:00:00.000Z" };
  const ravi = { userId: "u2", name: "Ravi", email: "ravi@example.com", addedAt: "2026-10-21T10:00:00.000Z" };

  it("reads the wrapped list, oldest first", () => {
    expect(membersOf({ members: [ravi, asha] })).toEqual([asha, ravi]);
  });

  it("accepts a bare array too", () => {
    expect(membersOf([asha])).toEqual([asha]);
  });

  it("sorts mixed time zones by the real time", () => {
    const early = { ...ravi, addedAt: "2026-10-21T12:00:00+05:30" }; // 06:30Z
    const late = { ...asha, addedAt: "2026-10-21T07:00:00Z" };
    expect(membersOf([late, early]).map((m) => m.userId)).toEqual(["u2", "u1"]);
  });

  it("puts unreadable times last and drops entries without an id or email, and repeats", () => {
    const noTime = { userId: "u3", name: "Meera", email: "meera@example.com" };
    expect(membersOf({ members: [noTime, ravi, { name: "x" }, { userId: "u4" }, asha, asha] }).map((m) => m.userId)).toEqual([
      "u1",
      "u2",
      "u3",
    ]);
  });

  it("shows the email when there's no name", () => {
    expect(memberOf({ userId: "u5", email: "neha@example.com" })).toEqual({
      userId: "u5",
      name: "neha@example.com",
      email: "neha@example.com",
      addedAt: null,
    });
  });

  it("returns an empty list for anything else", () => {
    expect(membersOf(null)).toEqual([]);
    expect(membersOf({ error: "Not found" })).toEqual([]);
  });

  it("adds someone at the bottom", () => {
    expect(withMember([asha], ravi)).toEqual([asha, ravi]);
  });

  it("doesn't list someone twice when they're added again", () => {
    const again = { ...asha, name: "Asha K" };
    expect(withMember([asha, ravi], again)).toEqual([again, ravi]);
  });

  it("removes someone", () => {
    expect(withoutMember([asha, ravi], "u1")).toEqual([ravi]);
    expect(withoutMember([asha], "nobody")).toEqual([asha]);
  });
});

describe("sharedCollectionsOf", () => {
  const older = { id: "b1", name: "Reds", ownerName: "Asha", addedAt: "2026-10-20T10:00:00.000Z", visibleCount: 3 };
  const newer = { id: "b2", name: "Mehendi", ownerName: "Ravi", addedAt: "2026-10-22T10:00:00.000Z", visibleCount: 0 };

  it("reads { buckets }, newest first", () => {
    expect(sharedCollectionsOf({ buckets: [older, newer] })).toEqual([newer, older]);
  });

  it("fills in missing names and counts, and drops entries without an id or repeats", () => {
    expect(sharedCollectionsOf({ buckets: [{ id: "b3", visibleCount: -2 }, { name: "no id" }, older, older] })).toEqual([
      older,
      { id: "b3", name: "Untitled collection", ownerName: "Someone", addedAt: null, visibleCount: 0 },
    ]);
  });

  it("returns an empty list for anything else", () => {
    expect(sharedCollectionsOf(undefined)).toEqual([]);
    expect(sharedCollectionsOf({ buckets: "nope" })).toEqual([]);
  });
});

describe("collectionInfoOf", () => {
  it("reads the owner's and a member's view", () => {
    expect(collectionInfoOf({ id: "b1", name: "Reds", ownerName: "Asha", role: "owner" })).toEqual({
      id: "b1",
      name: "Reds",
      ownerName: "Asha",
      role: "owner",
    });
    expect(collectionInfoOf({ id: "b1", name: "Reds", ownerName: "Asha", role: "member" })?.role).toBe("member");
  });

  it("is null when missing or the role is unknown", () => {
    expect(collectionInfoOf(undefined)).toBeNull();
    expect(collectionInfoOf({ id: "b1", name: "Reds", role: "viewer" })).toBeNull();
  });
});

describe("counts and notes", () => {
  it("reads counts safely", () => {
    expect(countOf(3)).toBe(3);
    expect(countOf(2.7)).toBe(2);
    expect(countOf(-1)).toBe(0);
    expect(countOf("4")).toBe(0);
    expect(countOf(undefined)).toBe(0);
  });

  it("counts private photos", () => {
    expect(privateCount([{ visibility: "public" }, { visibility: "private" }, { visibility: "private" }])).toBe(2);
    expect(privateCount([])).toBe(0);
  });

  it("warns the owner about private photos", () => {
    expect(privateShareNote(0)).toBeNull();
    expect(privateShareNote(1)).toBe("1 private photo won't be visible to people you share with.");
    expect(privateShareNote(3)).toBe("3 private photos won't be visible to people you share with.");
    expect(privateShareNote(3, true)).toBe("At least 3 private photos won't be visible to people you share with.");
  });

  it("says how many photos are hidden", () => {
    expect(hiddenPhotosNote(0)).toBeNull();
    expect(hiddenPhotosNote(1)).toBe("1 photo is hidden because it is private.");
    expect(hiddenPhotosNote(4)).toBe("4 photos are hidden because they are private.");
  });
});

describe("initialOf", () => {
  it("uses the name, then the email", () => {
    expect(initialOf("asha")).toBe("A");
    expect(initialOf("  ", "ravi@example.com")).toBe("R");
    expect(initialOf("", "")).toBe("?");
  });

  it("keeps a whole character", () => {
    expect(initialOf("😀 Party")).toBe("😀");
    expect(initialOf("अनन्या")).toBe("अ");
  });
});

describe("adding someone", () => {
  const entry = { userId: "u1", name: "Asha", email: "asha@example.com", addedAt: "2026-10-24T10:00:00.000Z" };

  it("reads the member and whether they were emailed", () => {
    expect(addedMemberOf({ ...entry, emailed: true })).toEqual({ member: entry, emailed: true });
    expect(addedMemberOf({ ...entry, emailed: false })).toEqual({ member: entry, emailed: false });
  });

  it("only counts a real true as emailed", () => {
    expect(addedMemberOf(entry).emailed).toBe(false);
    expect(addedMemberOf({ ...entry, emailed: "true" }).emailed).toBe(false);
    expect(addedMemberOf({ ...entry, emailed: 1 }).emailed).toBe(false);
  });

  it("keeps emailed when the entry can't be read", () => {
    expect(addedMemberOf({ emailed: true })).toEqual({ member: null, emailed: true });
    expect(addedMemberOf(null)).toEqual({ member: null, emailed: false });
  });

  it("says an email was sent only when it was", () => {
    expect(emailedNote(true)).toBe("We've sent them an email");
    expect(emailedNote(false)).toBeNull();
  });
});
