import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import SortChip from "../SortChip.svelte";

describe("SortChip", () => {
  it("renders field name and ascending arrow", () => {
    const { container } = render(SortChip, {
      props: { field: "page_count", direction: "asc" },
    });
    const chip = container.querySelector(".search-chip");
    expect(chip).toBeInTheDocument();
    expect(chip?.textContent).toContain("page_count");
    expect(chip?.textContent).toContain("\u2191"); // ↑
  });

  it("renders field name and descending arrow", () => {
    const { container } = render(SortChip, {
      props: { field: "created_at", direction: "desc" },
    });
    const chip = container.querySelector(".search-chip");
    expect(chip?.textContent).toContain("created_at");
    expect(chip?.textContent).toContain("\u2193"); // ↓
  });

  it("defaults to ascending", () => {
    const { container } = render(SortChip, {
      props: { field: "page_count" },
    });
    const chip = container.querySelector(".search-chip");
    expect(chip?.textContent).toContain("\u2191"); // ↑
  });

  it("has the search-sort class", () => {
    const { container } = render(SortChip, {
      props: { field: "created_at", direction: "desc" },
    });
    const chip = container.querySelector(".search-sort");
    expect(chip).toBeInTheDocument();
  });
});
