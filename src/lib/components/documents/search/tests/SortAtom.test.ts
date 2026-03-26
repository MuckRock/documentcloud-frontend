import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import SortAtom from "../SortAtom.svelte";

describe("SortAtom", () => {
  it("renders field name and ascending arrow", () => {
    const { container } = render(SortAtom, {
      props: { field: "page_count", direction: "asc" },
    });
    const atom = container.querySelector(".search-atom");
    expect(atom).toBeInTheDocument();
    expect(atom?.textContent).toContain("page_count");
    expect(atom?.textContent).toContain("\u2191"); // ↑
  });

  it("renders field name and descending arrow", () => {
    const { container } = render(SortAtom, {
      props: { field: "created_at", direction: "desc" },
    });
    const atom = container.querySelector(".search-atom");
    expect(atom?.textContent).toContain("created_at");
    expect(atom?.textContent).toContain("\u2193"); // ↓
  });

  it("defaults to ascending", () => {
    const { container } = render(SortAtom, {
      props: { field: "page_count" },
    });
    const atom = container.querySelector(".search-atom");
    expect(atom?.textContent).toContain("\u2191"); // ↑
  });

  it("has the search-sort class", () => {
    const { container } = render(SortAtom, {
      props: { field: "created_at", direction: "desc" },
    });
    const atom = container.querySelector(".search-sort");
    expect(atom).toBeInTheDocument();
  });
});
