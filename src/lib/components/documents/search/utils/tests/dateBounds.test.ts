import { describe, it, expect } from "vitest";
import {
  DATE_FIELDS,
  formatDateBound,
  escapeRangeBound,
  unescapeRangeBound,
} from "../dateBounds";

describe("formatDateBound", () => {
  it("appends start-of-day to a bare lower date", () => {
    expect(formatDateBound("2024-01-01", "lower")).toBe("2024-01-01T00:00:00Z");
  });

  it("appends end-of-day to a bare upper date", () => {
    expect(formatDateBound("2024-01-31", "upper")).toBe("2024-01-31T23:59:59Z");
  });

  it("passes through the open-ended '*' bound", () => {
    expect(formatDateBound("*", "lower")).toBe("*");
    expect(formatDateBound("*", "upper")).toBe("*");
  });

  it("passes through an empty string", () => {
    expect(formatDateBound("", "lower")).toBe("");
    expect(formatDateBound("", "upper")).toBe("");
  });

  it("passes through Solr date math (NOW-...)", () => {
    expect(formatDateBound("NOW-7DAYS", "lower")).toBe("NOW-7DAYS");
    expect(formatDateBound("NOW", "upper")).toBe("NOW");
  });

  it("passes through an already-formatted ISO timestamp", () => {
    expect(formatDateBound("2024-01-01T00:00:00Z", "lower")).toBe(
      "2024-01-01T00:00:00Z",
    );
    expect(formatDateBound("2024-01-31T23:59:59Z", "upper")).toBe(
      "2024-01-31T23:59:59Z",
    );
  });

  it("passes through non-date strings unchanged", () => {
    expect(formatDateBound("50", "lower")).toBe("50");
    expect(formatDateBound("foo", "upper")).toBe("foo");
  });
});

describe("escapeRangeBound / unescapeRangeBound", () => {
  it("escapes colons in an ISO timestamp", () => {
    expect(escapeRangeBound("2024-01-01T00:00:00Z")).toBe(
      "2024-01-01T00\\:00\\:00Z",
    );
  });

  it("leaves colon-free bounds untouched", () => {
    expect(escapeRangeBound("*")).toBe("*");
    expect(escapeRangeBound("NOW-1MONTH")).toBe("NOW-1MONTH");
    expect(escapeRangeBound("50")).toBe("50");
    expect(escapeRangeBound("2024-01-01")).toBe("2024-01-01");
  });

  it("round-trips through escape then unescape", () => {
    const clean = "2024-01-31T23:59:59Z";
    expect(unescapeRangeBound(escapeRangeBound(clean))).toBe(clean);
  });

  it("unescape is a no-op on already-clean bounds", () => {
    expect(unescapeRangeBound("2024-01-01T00:00:00Z")).toBe(
      "2024-01-01T00:00:00Z",
    );
    expect(unescapeRangeBound("*")).toBe("*");
  });
});

describe("DATE_FIELDS", () => {
  it("contains the date fields that need Solr time suffixes", () => {
    expect(DATE_FIELDS.has("created_at")).toBe(true);
    expect(DATE_FIELDS.has("updated_at")).toBe(true);
  });

  it("does not contain non-date fields", () => {
    expect(DATE_FIELDS.has("page_count")).toBe(false);
    expect(DATE_FIELDS.has("user")).toBe(false);
  });
});
