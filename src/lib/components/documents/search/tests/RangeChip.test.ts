import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import RangeChip from "../RangeChip.svelte";

describe("RangeChip", () => {
  it("renders field and bounds", () => {
    const { container } = render(RangeChip, {
      props: { field: "created_at", lower: "NOW-1MONTH", upper: "*" },
    });
    const chip = container.querySelector(".search-chip");
    expect(chip).toBeInTheDocument();
    expect(chip?.textContent).toContain("created_at");
    expect(chip?.textContent).toContain("NOW-1MONTH");
    expect(chip?.textContent).toContain("*");
  });

  it("shows inclusive brackets by default", () => {
    const { container } = render(RangeChip, {
      props: { field: "page_count", lower: "10", upper: "100" },
    });
    const chip = container.querySelector(".search-chip");
    expect(chip?.textContent).toContain("[");
    expect(chip?.textContent).toContain("]");
  });

  it("shows exclusive brackets when specified", () => {
    const { container } = render(RangeChip, {
      props: {
        field: "page_count",
        lower: "10",
        upper: "100",
        inclusiveLower: false,
        inclusiveUpper: false,
      },
    });
    const chip = container.querySelector(".search-chip");
    expect(chip?.textContent).toContain("{");
    expect(chip?.textContent).toContain("}");
  });

  it("shows mixed brackets (inclusive lower, exclusive upper)", () => {
    const { container } = render(RangeChip, {
      props: {
        field: "page_count",
        lower: "10",
        upper: "100",
        inclusiveLower: true,
        inclusiveUpper: false,
      },
    });
    const chip = container.querySelector(".search-chip");
    const text = chip?.textContent ?? "";
    expect(text).toContain("[");
    expect(text).toContain("}");
  });

  it("shows prefix indicator", () => {
    const { container } = render(RangeChip, {
      props: {
        field: "page_count",
        lower: "10",
        upper: "100",
        prefix: "+",
      },
    });
    const prefix = container.querySelector(".chip-prefix");
    expect(prefix).toBeInTheDocument();
    expect(prefix?.textContent).toBe("+");
  });

  it("displays ISO dates in locale format", () => {
    const { container } = render(RangeChip, {
      props: {
        field: "created_at",
        lower: "2022-04-20T00:00:00Z",
        upper: "2022-05-30T23:59:59Z",
      },
    });
    const bounds = container.querySelector(".chip-bounds");
    const expectedLower = new Date("2022-04-20T00:00:00Z").toLocaleDateString();
    const expectedUpper = new Date("2022-05-30T23:59:59Z").toLocaleDateString();
    expect(bounds?.textContent).toContain(expectedLower);
    expect(bounds?.textContent).toContain(expectedUpper);
    expect(bounds?.textContent).not.toContain("T00:00:00Z");
    expect(bounds?.textContent).not.toContain("T23:59:59Z");
  });

  it("preserves date math expressions as-is", () => {
    const { container } = render(RangeChip, {
      props: { field: "created_at", lower: "NOW-1MONTH", upper: "*" },
    });
    const bounds = container.querySelector(".chip-bounds");
    expect(bounds?.textContent).toContain("NOW-1MONTH");
  });

  it("preserves numeric values as-is", () => {
    const { container } = render(RangeChip, {
      props: { field: "page_count", lower: "10", upper: "100" },
    });
    const bounds = container.querySelector(".chip-bounds");
    expect(bounds?.textContent).toContain("10");
    expect(bounds?.textContent).toContain("100");
  });

  it("has the search-range class", () => {
    const { container } = render(RangeChip, {
      props: { field: "created_at", lower: "NOW-1MONTH", upper: "*" },
    });
    const chip = container.querySelector(".search-range");
    expect(chip).toBeInTheDocument();
  });
});
