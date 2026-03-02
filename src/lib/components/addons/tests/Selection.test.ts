import type { Document } from "$lib/api/types";

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

import SelectionDemo from "./Selection.demo.svelte";
import { document as docFixture } from "@/test/fixtures/documents";

function makeDocs(count: number): Document[] {
  return Array.from({ length: count }, (_, i) => ({
    ...docFixture,
    id: 1000 + i,
  }));
}

describe("Selection", () => {
  it("renders radio options for query and selected", () => {
    const docs = makeDocs(3);
    render(SelectionDemo, {
      props: {
        docs,
        documents: new Set(["query", "selected"]),
        query: "test query",
        resultsCount: 100,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
  });

  it("shows correct count in the query label", () => {
    const docs = makeDocs(3);
    render(SelectionDemo, {
      props: {
        docs,
        documents: new Set(["query", "selected"]),
        query: "test query",
        resultsCount: 100,
      },
    });

    expect(
      screen.getByText(/100 documents from the current search/i),
    ).toBeTruthy();
  });

  it("shows correct count in the selected label", () => {
    const docs = makeDocs(3);
    render(SelectionDemo, {
      props: {
        docs,
        documents: new Set(["query", "selected"]),
        query: "test query",
        resultsCount: 100,
      },
    });

    expect(screen.getByText(/3 currently selected documents/i)).toBeTruthy();
  });

  it("populates the documents hidden input with selected IDs", () => {
    const docs = makeDocs(3);
    const { container } = render(SelectionDemo, {
      props: {
        docs,
        documents: new Set(["query", "selected"]),
        query: "test query",
        resultsCount: 100,
      },
    });

    const hidden = container.querySelector(
      'input[type="hidden"][name="documents"]',
    ) as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toBe(docs.map((d) => d.id).join(","));
  });

  it("populates the query hidden input with the query string", () => {
    const docs = makeDocs(3);
    const { container } = render(SelectionDemo, {
      props: {
        docs,
        documents: new Set(["query", "selected"]),
        query: "test query",
        resultsCount: 100,
      },
    });

    const hidden = container.querySelector(
      'input[type="hidden"][name="query"]',
    ) as HTMLInputElement;
    expect(hidden).toBeTruthy();
    expect(hidden.value).toBe("test query");
  });

  it("renders only the query option when selected is not in documents", () => {
    render(SelectionDemo, {
      props: {
        docs: [],
        documents: new Set(["query"]),
        query: "test query",
        resultsCount: 50,
      },
    });

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(1);
    expect(
      screen.getByText(/50 documents from the current search/i),
    ).toBeTruthy();
  });
});
