import type { Document } from "$lib/api/types";

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";

import DocumentListDemo from "./DocumentList.demo.svelte";
import { document as docFixture } from "@/test/fixtures/documents";

function makeDocs(count: number): Document[] {
  return Array.from({ length: count }, (_, i) => ({
    ...docFixture,
    id: 1000 + i,
    title: `Document ${i + 1}`,
  }));
}

describe("DocumentList", () => {
  it("shows results", () => {
    const docs = makeDocs(3);
    render(DocumentListDemo, { props: { docs } });

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
    expect(headings.map((h) => h.textContent)).toEqual(
      docs.map((d) => d.title),
    );
  });

  it("shows loading state when loading with no results", () => {
    render(DocumentListDemo, { props: { loading: true } });

    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it("shows results even when loading is true", () => {
    const docs = makeDocs(2);
    render(DocumentListDemo, { props: { docs, loading: true } });

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(2);
  });

  it("select-all checkbox is unchecked when nothing is selected", () => {
    const docs = makeDocs(3);
    render(DocumentListDemo, { props: { docs } });

    const selectAll = screen.getByRole("checkbox", { name: /select all/i });
    expect(selectAll).not.toBeChecked();
  });

  it("select-all checkbox is unchecked when there are no results", () => {
    render(DocumentListDemo);

    const selectAll = screen.getByRole("checkbox", { name: /select all/i });
    expect(selectAll).not.toBeChecked();
  });

  it("select-all checkbox is checked when all documents are selected", () => {
    const docs = makeDocs(3);
    const selectedIds = docs.map((d) => String(d.id));
    render(DocumentListDemo, { props: { docs, selectedIds } });

    const selectAll = screen.getByRole("checkbox", { name: /selected/i });
    expect(selectAll).toBeChecked();
  });

  it("select-all checkbox is indeterminate when some documents are selected", () => {
    const docs = makeDocs(3);
    const selectedIds = [String(docs[0]!.id)];
    render(DocumentListDemo, { props: { docs, selectedIds } });

    const selectAll = screen.getByRole("checkbox", {
      name: /1 selected/i,
    });
    expect(selectAll).toHaveProperty("indeterminate", true);
  });

  it("shows results count in footer", () => {
    const docs = makeDocs(3);
    render(DocumentListDemo, { props: { docs } });

    expect(screen.getByText(/3 of 3/i)).toBeTruthy();
  });

  it("selects all documents via the select-all checkbox", async () => {
    const docs = makeDocs(3);
    render(DocumentListDemo, { props: { docs } });

    const selectAll = screen.getByRole("checkbox", { name: /select all/i });
    await fireEvent.click(selectAll);

    // all individual checkboxes should now be checked
    const checkboxes = screen.getAllByRole("checkbox");
    // first is select-all, rest are individual
    checkboxes.forEach((c) => {
      expect(c).toBeChecked();
    });
  });

  it("deselects all documents via the select-all checkbox", async () => {
    const docs = makeDocs(3);
    const selectedIds = docs.map((d) => String(d.id));
    render(DocumentListDemo, { props: { docs, selectedIds } });

    const selectAll = screen.getByRole("checkbox", { name: /selected/i });
    await fireEvent.click(selectAll);

    // all individual checkboxes should now be unchecked
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((c) => {
      expect(c).not.toBeChecked();
    });
  });
});
