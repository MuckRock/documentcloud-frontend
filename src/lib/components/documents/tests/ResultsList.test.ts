import type { DocumentResults } from "$lib/api/types";
import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import { render, screen, fireEvent } from "@testing-library/svelte";

import ResultsList from "./ResultsList.demo.svelte";
import { selected, selectedIds } from "../ResultsList.svelte";
import searchResults from "@/test/fixtures/documents/search-highlight.json";

const results = searchResults as unknown as DocumentResults;

const empty: DocumentResults = {
  results: [],
  count: 0,
  next: null,
  previous: null,
  escaped: false,
};

describe("ResultsList", () => {
  beforeEach(() => {
    selectedIds.set([]);
  });

  it("shows results", () => {
    render(ResultsList, {
      results: results.results,
      count: results.count,
      next: results.next,
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
    render(ResultsList, { results: empty.results });

    const heading = screen.getByRole("heading");

    expect(heading.textContent).toEqual("No search results");
  });

  it("populates $selectedIds store", () => {
    render(ResultsList, {
      results: results.results,
      count: results.count,
      next: results.next,
    });

    expect(get(selectedIds)).toEqual([]);

    const checkboxes = screen.getAllByRole("checkbox");

    // check all the boxes
    checkboxes.forEach(async (c) => {
      await fireEvent.click(c);
    });

    expect(get(selectedIds)).toEqual(results.results.map((d) => String(d.id)));
  });

  it("builds the $selected store from the $selectedIds and $visible store", () => {
    render(ResultsList, {
      results: results.results,
      count: results.count,
      next: results.next,
    });

    expect(get(selectedIds)).toEqual([]);
    expect(get(selected)).toEqual([]);

    const checkboxes = screen.getAllByRole("checkbox");

    // check all the boxes
    checkboxes.forEach(async (c) => {
      await fireEvent.click(c);
    });

    expect(get(selected)).toEqual(results.results);
  });
});
