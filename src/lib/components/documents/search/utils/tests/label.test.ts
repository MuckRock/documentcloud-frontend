import { describe, expect, test } from "vitest";
import {
  displayBound,
  fieldValueLabel,
  rangeLabel,
  sortLabel,
  atomLabel,
} from "../label.js";

describe("displayBound", () => {
  test("returns plain values unchanged", () => {
    expect(displayBound("hello")).toBe("hello");
    expect(displayBound("42")).toBe("42");
    expect(displayBound("*")).toBe("*");
  });

  test("formats ISO dates as locale strings", () => {
    const result = displayBound("2024-01-15");
    const localeString = new Date("2024-01-15").toLocaleDateString();
    expect(result).toEqual(localeString);
  });

  test("formats ISO datetime as locale string", () => {
    const result = displayBound("2024-01-15T00:00:00Z");
    const localeString = new Date("2024-01-15T00:00:00Z").toLocaleDateString();
    expect(result).toEqual(localeString);
  });

  test("does not treat bare numbers as dates", () => {
    expect(displayBound("1")).toBe("1");
    expect(displayBound("50")).toBe("50");
  });
});

describe("fieldValueLabel", () => {
  test("basic field:value", () => {
    expect(fieldValueLabel({ field: "user", value: "123" })).toBe("user: 123");
  });

  test("uses displayValue over value", () => {
    expect(
      fieldValueLabel({ field: "user", value: "123", displayValue: "Alice" }),
    ).toBe("user: Alice");
  });

  test("required prefix", () => {
    expect(fieldValueLabel({ field: "tag", value: "news", prefix: "+" })).toBe(
      "required, tag: news",
    );
  });

  test("excluded prefix", () => {
    expect(fieldValueLabel({ field: "tag", value: "spam", prefix: "-" })).toBe(
      "excluded, tag: spam",
    );
  });

  test("boost suffix", () => {
    expect(fieldValueLabel({ field: "title", value: "test", boost: 3 })).toBe(
      "title: test, boost 3",
    );
  });

  test("boost of 1 is not shown", () => {
    expect(fieldValueLabel({ field: "title", value: "test", boost: 1 })).toBe(
      "title: test",
    );
  });

  test("all modifiers combined", () => {
    expect(
      fieldValueLabel({
        field: "title",
        value: "test",
        prefix: "+",
        boost: 5,
      }),
    ).toBe("required, title: test, boost 5");
  });
});

describe("rangeLabel", () => {
  test("inclusive range", () => {
    expect(rangeLabel({ field: "pages", lower: "1", upper: "50" })).toBe(
      "pages: from 1 to 50",
    );
  });

  test("exclusive bounds", () => {
    expect(
      rangeLabel({
        field: "pages",
        lower: "1",
        upper: "50",
        inclusiveLower: false,
        inclusiveUpper: false,
      }),
    ).toBe("pages: after 1 before 50");
  });

  test("with prefix", () => {
    expect(
      rangeLabel({ field: "pages", lower: "1", upper: "10", prefix: "-" }),
    ).toBe("excluded, pages: from 1 to 10");
  });

  test("wildcard bounds default", () => {
    expect(rangeLabel({ field: "score" })).toBe("score: from any to any");
  });
});

describe("sortLabel", () => {
  test("ascending", () => {
    expect(sortLabel({ field: "created_at", direction: "asc" })).toBe(
      "Sort by created_at, ascending",
    );
  });

  test("descending", () => {
    expect(sortLabel({ field: "score", direction: "desc" })).toBe(
      "Sort by score, descending",
    );
  });
});

describe("atomLabel", () => {
  test("delegates to fieldValueLabel", () => {
    expect(atomLabel("field-value", { field: "user", value: "1" })).toBe(
      "user: 1",
    );
  });

  test("delegates to rangeLabel", () => {
    expect(
      atomLabel("range", { field: "pages", lower: "1", upper: "10" }),
    ).toBe("pages: from 1 to 10");
  });

  test("delegates to sortLabel", () => {
    expect(atomLabel("sort", { field: "created_at", direction: "desc" })).toBe(
      "Sort by created_at, descending",
    );
  });

  test("returns empty string for unknown type", () => {
    expect(atomLabel("unknown", {})).toBe("");
  });
});
