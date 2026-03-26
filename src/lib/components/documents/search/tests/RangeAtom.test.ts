import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import RangeAtom from "../RangeAtom.svelte";

describe("RangeAtom", () => {
  it("renders field and bounds", () => {
    const { container } = render(RangeAtom, {
      props: { field: "created_at", lower: "NOW-1MONTH", upper: "*" },
    });
    const atom = container.querySelector(".search-atom");
    expect(atom).toBeInTheDocument();
    expect(atom?.textContent).toContain("created_at");
    expect(atom?.textContent).toContain("NOW-1MONTH");
    expect(atom?.textContent).toContain("*");
  });

  it("shows inclusive brackets by default", () => {
    const { container } = render(RangeAtom, {
      props: { field: "page_count", lower: "10", upper: "100" },
    });
    const atom = container.querySelector(".search-atom");
    expect(atom?.textContent).toContain("[");
    expect(atom?.textContent).toContain("]");
  });

  it("shows exclusive brackets when specified", () => {
    const { container } = render(RangeAtom, {
      props: {
        field: "page_count",
        lower: "10",
        upper: "100",
        inclusiveLower: false,
        inclusiveUpper: false,
      },
    });
    const atom = container.querySelector(".search-atom");
    expect(atom?.textContent).toContain("{");
    expect(atom?.textContent).toContain("}");
  });

  it("shows mixed brackets (inclusive lower, exclusive upper)", () => {
    const { container } = render(RangeAtom, {
      props: {
        field: "page_count",
        lower: "10",
        upper: "100",
        inclusiveLower: true,
        inclusiveUpper: false,
      },
    });
    const atom = container.querySelector(".search-atom");
    const text = atom?.textContent ?? "";
    expect(text).toContain("[");
    expect(text).toContain("}");
  });

  it("shows prefix indicator", () => {
    const { container } = render(RangeAtom, {
      props: {
        field: "page_count",
        lower: "10",
        upper: "100",
        prefix: "+",
      },
    });
    const prefix = container.querySelector(".atom-prefix");
    expect(prefix).toBeInTheDocument();
    expect(prefix?.textContent).toBe("+");
  });

  it("displays ISO dates in locale format", () => {
    const { container } = render(RangeAtom, {
      props: {
        field: "created_at",
        lower: "2022-04-20T00:00:00Z",
        upper: "2022-05-30T23:59:59Z",
      },
    });
    const bounds = container.querySelector(".atom-bounds");
    const expectedLower = new Date("2022-04-20T00:00:00Z").toLocaleDateString();
    const expectedUpper = new Date("2022-05-30T23:59:59Z").toLocaleDateString();
    expect(bounds?.textContent).toContain(expectedLower);
    expect(bounds?.textContent).toContain(expectedUpper);
    expect(bounds?.textContent).not.toContain("T00:00:00Z");
    expect(bounds?.textContent).not.toContain("T23:59:59Z");
  });

  it("preserves date math expressions as-is", () => {
    const { container } = render(RangeAtom, {
      props: { field: "created_at", lower: "NOW-1MONTH", upper: "*" },
    });
    const bounds = container.querySelector(".atom-bounds");
    expect(bounds?.textContent).toContain("NOW-1MONTH");
  });

  it("preserves numeric values as-is", () => {
    const { container } = render(RangeAtom, {
      props: { field: "page_count", lower: "10", upper: "100" },
    });
    const bounds = container.querySelector(".atom-bounds");
    expect(bounds?.textContent).toContain("10");
    expect(bounds?.textContent).toContain("100");
  });

  it("preserves negative numbers as-is", () => {
    const { container } = render(RangeAtom, {
      props: { field: "score", lower: "-5", upper: "10" },
    });
    const bounds = container.querySelector(".atom-bounds");
    expect(bounds?.textContent).toContain("-5");
    expect(bounds?.textContent).toContain("10");
  });

  it("has the search-range class", () => {
    const { container } = render(RangeAtom, {
      props: { field: "created_at", lower: "NOW-1MONTH", upper: "*" },
    });
    const atom = container.querySelector(".search-range");
    expect(atom).toBeInTheDocument();
  });
});
