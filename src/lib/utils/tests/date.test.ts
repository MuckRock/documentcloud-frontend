import { describe, it, expect } from "vitest";
import { toDatetimeLocal } from "../date";

describe("toDatetimeLocal", () => {
  it("formats a date as YYYY-MM-DDThh:mm in local time", () => {
    const date = new Date(2026, 2, 15, 9, 5); // March 15, 2026 09:05
    expect(toDatetimeLocal(date)).toBe("2026-03-15T09:05");
  });

  it("pads single-digit months, days, hours, and minutes", () => {
    const date = new Date(2026, 0, 3, 4, 7); // Jan 3, 2026 04:07
    expect(toDatetimeLocal(date)).toBe("2026-01-03T04:07");
  });

  it("handles midnight", () => {
    const date = new Date(2026, 11, 31, 0, 0); // Dec 31, 2026 00:00
    expect(toDatetimeLocal(date)).toBe("2026-12-31T00:00");
  });

  it("handles end of day", () => {
    const date = new Date(2026, 5, 15, 23, 59); // June 15, 2026 23:59
    expect(toDatetimeLocal(date)).toBe("2026-06-15T23:59");
  });
});
