import type { Document } from "$lib/api/types";

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/svelte";

import DocumentListDemo from "./DocumentList.demo.svelte";
import { document as docFixture } from "@/test/fixtures/documents";
import { stubViewport } from "@/test/helpers/stubViewport";

function makeDocs(count: number): Document[] {
  return Array.from({ length: count }, (_, i) => ({
    ...docFixture,
    id: 1000 + i,
    title: `Document ${i + 1}`,
  }));
}

/** Render the list and wait for virtua to mount the rows in view. */
async function renderDocs(props: Record<string, unknown>) {
  const rendered = render(DocumentListDemo, { props });
  await waitFor(() =>
    expect(screen.getAllByRole("heading", { level: 3 }).length).toBeGreaterThan(
      0,
    ),
  );
  return rendered;
}

describe("DocumentList", () => {
  beforeEach(() => stubViewport({ itemHeight: 150 }));

  it("shows results", async () => {
    const docs = makeDocs(3);
    await renderDocs({ docs });

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
    expect(headings.map((h) => h.textContent)).toEqual(
      docs.map((d) => d.title),
    );
  });

  it("renders only the results in view from a long list", async () => {
    const docs = makeDocs(25);
    await renderDocs({ docs });

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.length).toBeLessThan(docs.length);
    expect(headings[0]).toHaveTextContent("Document 1");
  });

  it("shows loading state when loading with no results", () => {
    render(DocumentListDemo, { props: { loading: true } });

    expect(screen.getByText(/loading/i)).toBeTruthy();
  });

  it("shows results even when loading is true", async () => {
    const docs = makeDocs(2);
    await renderDocs({ docs, loading: true });

    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(2);
  });

  it("select-all checkbox is unchecked when nothing is selected", async () => {
    const docs = makeDocs(3);
    await renderDocs({ docs });

    const selectAll = screen.getByRole("checkbox", { name: /select all/i });
    expect(selectAll).not.toBeChecked();
  });

  it("select-all checkbox is unchecked when there are no results", () => {
    render(DocumentListDemo);

    const selectAll = screen.getByRole("checkbox", { name: /select all/i });
    expect(selectAll).not.toBeChecked();
  });

  it("select-all checkbox is checked when all documents are selected", async () => {
    const docs = makeDocs(3);
    const selectedIds = docs.map((d) => String(d.id));
    await renderDocs({ docs, selectedIds });

    const selectAll = screen.getByRole("checkbox", { name: /selected/i });
    expect(selectAll).toBeChecked();
  });

  it("select-all checkbox is indeterminate when some documents are selected", async () => {
    const docs = makeDocs(3);
    const selectedIds = [String(docs[0]!.id)];
    await renderDocs({ docs, selectedIds });

    const selectAll = screen.getByRole("checkbox", {
      name: /1 selected/i,
    });
    expect(selectAll).toHaveProperty("indeterminate", true);
  });

  it("shows results count in footer", async () => {
    const docs = makeDocs(3);
    await renderDocs({ docs });

    expect(screen.getByText(/3 of 3/i)).toBeTruthy();
  });

  it("selects all documents via the select-all checkbox", async () => {
    const docs = makeDocs(3);
    await renderDocs({ docs });

    const selectAll = screen.getByRole("checkbox", { name: /select all/i });
    await fireEvent.click(selectAll);

    // all individual checkboxes should now be checked
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(docs.length + 1);
    checkboxes.forEach((c) => {
      expect(c).toBeChecked();
    });
  });

  it("deselects all documents via the select-all checkbox", async () => {
    const docs = makeDocs(3);
    const selectedIds = docs.map((d) => String(d.id));
    await renderDocs({ docs, selectedIds });

    const selectAll = screen.getByRole("checkbox", { name: /selected/i });
    await fireEvent.click(selectAll);

    // all individual checkboxes should now be unchecked
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(docs.length + 1);
    checkboxes.forEach((c) => {
      expect(c).not.toBeChecked();
    });
  });
});
