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

  it("has the search-range class", () => {
    const { container } = render(RangeChip, {
      props: { field: "created_at", lower: "NOW-1MONTH", upper: "*" },
    });
    const chip = container.querySelector(".search-range");
    expect(chip).toBeInTheDocument();
  });
});
