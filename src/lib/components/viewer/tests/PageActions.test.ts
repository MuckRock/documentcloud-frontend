import type { Document } from "$lib/api/types";

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

import PageActions from "../PageActions.svelte";
import documentFixture from "@/test/fixtures/documents/document.json";

// `page_number` is 1-indexed; sections are keyed by 0-indexed page. A section
// on page_number 0 belongs to page 1, so PageActions must offset the lookup or
// it labels the wrong page.
const baseDocument = {
  ...(documentFixture as Document),
  edit_access: true,
  sections: [{ id: 1, page_number: 0, title: "Introduction" }],
} as Document;

describe("PageActions section label", () => {
  it("shows 'Edit Section' on the page that has a section", () => {
    render(PageActions, {
      document: baseDocument,
      page_number: 1, // 1-indexed -> section at page_number 0
      pageWidth: 1000, // wide, so the inline actions render (not the kebab menu)
    });

    expect(
      screen.getByRole("button", { name: "Edit Section" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Start Section" }),
    ).not.toBeInTheDocument();
  });

  it("shows 'Start Section' on a page without a section", () => {
    render(PageActions, {
      document: baseDocument,
      page_number: 2, // 1-indexed -> would-be section at page_number 1 (none)
      pageWidth: 1000,
    });

    expect(
      screen.getByRole("button", { name: "Start Section" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit Section" }),
    ).not.toBeInTheDocument();
  });
});
