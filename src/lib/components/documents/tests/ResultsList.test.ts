import type { DocumentResults } from "$lib/api/types";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

import { stubViewport } from "@/test/helpers/stubViewport";

import ResultsList from "./ResultsList.demo.svelte";
import searchResults from "@/test/fixtures/documents/search-highlight.json";

const results = searchResults as unknown as DocumentResults;

async function renderResults() {
  const rendered = render(ResultsList, {
    results: results.results,
  });
  await waitFor(() =>
    expect(screen.getAllByRole("heading", { level: 3 }).length).toBeGreaterThan(
      0,
    ),
  );
  return rendered;
}

describe("ResultsList", () => {
  beforeEach(() => stubViewport({ itemHeight: 150 }));

  it("shows the results in view, in order", async () => {
    await renderResults();

    const headings = screen.getAllByRole("heading", { level: 3 });

    expect(headings.length).toBeLessThan(results.results.length);
    expect(headings.map((h) => h.textContent)).toEqual(
      results.results.slice(0, headings.length).map((d) => d.title),
    );
  });

  it("shows a fallback for no results", () => {
    render(ResultsList);

    const heading = screen.getByRole("heading");

    expect(heading.textContent).toEqual("No search results");
  });

  it("selects documents via checkboxes", async () => {
    await renderResults();

    const checkboxes = screen.getAllByRole("checkbox");

    // all unchecked initially
    checkboxes.forEach((c) => {
      expect(c).not.toBeChecked();
    });

    // check all the boxes
    for (const c of checkboxes) {
      await fireEvent.click(c);
    }

    // all should now be checked
    checkboxes.forEach((c) => {
      expect(c).toBeChecked();
    });
  });

  it("marks selected rows with the selected class", async () => {
    const { container } = await renderResults();

    // no rows selected initially
    expect(container.querySelectorAll(".result-row.selected")).toHaveLength(0);

    const checkboxes = screen.getAllByRole("checkbox");

    // check the first box
    await fireEvent.click(checkboxes[0]!);

    // one row should now be selected
    expect(container.querySelectorAll(".result-row.selected")).toHaveLength(1);
  });
});
