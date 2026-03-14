import type { DocumentResults } from "$lib/api/types";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";

import ResultsList from "./ResultsList.demo.svelte";
import searchResults from "@/test/fixtures/documents/search-highlight.json";

const results = searchResults as unknown as DocumentResults;

describe("ResultsList", () => {
  it("shows results", () => {
    render(ResultsList, {
      results: results.results,
    });

    const headings = screen.getAllByRole("heading", { level: 3 });

    // check that we rendered the right number of documents
    expect(headings.length).toEqual(results.results.length);

    // check that text is the same
    expect(headings.map((h) => h.textContent)).toEqual(
      results.results.map((d) => d.title),
    );
  });

  it("shows a fallback for no results", () => {
    render(ResultsList);

    const heading = screen.getByRole("heading");

    expect(heading.textContent).toEqual("No search results");
  });

  it("selects documents via checkboxes", async () => {
    render(ResultsList, {
      results: results.results,
    });

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
    const { container } = render(ResultsList, {
      results: results.results,
    });

    // no rows selected initially
    expect(container.querySelectorAll(".result-row.selected")).toHaveLength(0);

    const checkboxes = screen.getAllByRole("checkbox");

    // check the first box
    await fireEvent.click(checkboxes[0]!);

    // one row should now be selected
    expect(container.querySelectorAll(".result-row.selected")).toHaveLength(1);
  });
});
