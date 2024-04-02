import type { DocumentResults } from "$lib/api/types";
import { describe, it, expect } from "vitest";
import { get } from "svelte/store";
import { render, screen, fireEvent } from "@testing-library/svelte";

import ResultsList, { selected } from "../ResultsList.svelte";
import searchResults from "$lib/api/fixtures/documents/search-highlight.json";

const results = searchResults as DocumentResults;

const empty: DocumentResults = {
  results: [],
  count: 0,
  next: null,
  previous: null,
  escaped: false,
};

describe("ResultsList", () => {
  it("shows results", () => {
    render(ResultsList, {
      results: results.results,
      count: results.count,
      next: results.next,
    });

    const headings = screen.getAllByRole("heading");

    // check that we rendered the right number of documents
    expect(headings.length).toEqual(results.results.length);

    // check that text is the same
    expect(headings.map((h) => h.textContent)).toEqual(
      results.results.map((d) => d.title),
    );
  });

  it("shows a fallback for no results", () => {
    render(ResultsList, { results: empty.results });

    const heading = screen.getByRole("heading");

    expect(heading.textContent).toEqual("No search results");
  });

  it("populates $selected store", () => {
    render(ResultsList, {
      results: results.results,
      count: results.count,
      next: results.next,
    });

    expect(get(selected)).toEqual([]);

    const checkboxes = screen.getAllByRole("checkbox");

    // check all the boxes
    checkboxes.forEach(async (c) => {
      await fireEvent.click(c);
    });

    expect(get(selected)).toEqual(results.results.map((d) => d.id));
  });
});
