import { describe, expect, it } from "vitest";
import { parseHandoff } from "./plannerHandoff";

const now = 1_800_000_000_000;
const stored = (events: unknown, at: unknown = now) => JSON.stringify({ events, at });

describe("parseHandoff", () => {
  it("returns known events in the calculator's order", () => {
    expect(parseHandoff(stored(["Reception", "Haldi", "Wedding"]), now)).toEqual(["Haldi", "Wedding", "Reception"]);
  });

  it("drops unknown events and duplicates", () => {
    expect(parseHandoff(stored(["Sangeet", "Sangeet", "Bachelor party", 42]), now)).toEqual(["Sangeet"]);
  });

  it("ignores empty, missing, broken or stale data", () => {
    expect(parseHandoff(null, now)).toBeNull();
    expect(parseHandoff("not json", now)).toBeNull();
    expect(parseHandoff(stored([]), now)).toBeNull();
    expect(parseHandoff(stored("Haldi"), now)).toBeNull();
    expect(parseHandoff(stored(["Haldi"], "yesterday"), now)).toBeNull();
    expect(parseHandoff(stored(["Haldi"], now - 7 * 60 * 60 * 1000), now)).toBeNull();
  });
});
