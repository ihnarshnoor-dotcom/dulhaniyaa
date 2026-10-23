import { describe, expect, it } from "vitest";
import { earliestEventDate, isFarEnoughAhead, MIN_DAYS_AHEAD } from "./enquirySchema";

// 23 Oct 2026, mid-afternoon local time.
const now = new Date(2026, 9, 23, 15, 30);

describe("earliestEventDate", () => {
  it("is 15 days after today", () => {
    expect(MIN_DAYS_AHEAD).toBe(15);
    expect(earliestEventDate(now)).toBe("2026-11-07");
  });

  it("rolls over months and years", () => {
    expect(earliestEventDate(new Date(2026, 11, 25))).toBe("2027-01-09");
    expect(earliestEventDate(new Date(2028, 1, 20))).toBe("2028-03-06"); // leap year
  });

  it("uses the local date, even just before midnight", () => {
    expect(earliestEventDate(new Date(2026, 9, 23, 23, 59))).toBe("2026-11-07");
  });
});

describe("isFarEnoughAhead", () => {
  it("accepts the earliest date and anything later", () => {
    expect(isFarEnoughAhead("2026-11-07", now)).toBe(true);
    expect(isFarEnoughAhead("2027-02-14", now)).toBe(true);
  });

  it.each(["2026-11-06", "2026-10-24", "2026-10-23", "2025-12-01"])("rejects %s (sooner than 15 days)", (value) => {
    expect(isFarEnoughAhead(value, now)).toBe(false);
  });

  it.each(["", "07/11/2026", "2026-11-7", "not a date"])("rejects %j (not a YYYY-MM-DD date)", (value) => {
    expect(isFarEnoughAhead(value, now)).toBe(false);
  });
});
