import { vi, test, describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

import Share from "../Share.svelte";

import type { Document } from "@/lib/api/types";
import documentFixture from "@/test/fixtures/documents/document-expanded.json";
import {
  canonicalPageUrl,
  canonicalUrl,
  embedUrl,
  pageUrl,
} from "@/lib/api/documents";
import { canonicalNoteUrl, noteUrl } from "@/lib/api/notes";

describe("Share", () => {
  let document: Document;
  beforeEach(() => {
    document = documentFixture as Document;
  });
  it("lets a user share the whole document, a single page, or a note", async () => {
    render(Share, { document });
    const user = userEvent.setup();
    const tablist = screen.getByRole("tablist");
    expect(tablist).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(3);
    expect(tabs[0]).toHaveTextContent("Document");
    expect(tabs[1]).toHaveTextContent("Page");
    expect(tabs[2]).toHaveTextContent("Note");
    // switching tabs
    expect(tabs[0]).toHaveClass("active");
    await user.click(screen.getByText("Page"));
    expect(tabs[1]).toHaveClass("active");
    await user.click(screen.getByText("Note"));
    expect(tabs[2]).toHaveClass("active");
  });
  it("generates a permalink and iframe code for the document, page, or note", async () => {
    render(Share, { document });
    const user = userEvent.setup();
    let inputs = screen.getAllByRole("textbox");
    // Document tab
    await user.click(screen.getByText("Document"));
    expect(inputs[0]).toHaveValue(canonicalUrl(document).toString());
    expect(inputs[1]).toHaveValue(`<iframe src="${embedUrl(document)}" />`);
    // Page tab
    await user.click(screen.getByText("Page"));
    expect(inputs[0]).toHaveValue(pageUrl(document, 1).toString());
    expect(inputs[1]).toHaveValue(
      `<iframe src="${canonicalPageUrl(document, 1)}?embed=1" />`,
    );
    // Note tab
    await user.click(screen.getByText("Note"));
    expect(inputs[0]).toHaveValue(
      noteUrl(document, document.notes?.[0]!).toString(),
    );
    expect(inputs[1]).toHaveValue(
      `<iframe src="${canonicalNoteUrl(document, document.notes?.[0]!)}?embed=1" />`,
    );
  });
  it("allows the document embed to be customized, updating the embed URL accordingly", async () => {
    render(Share, { document });
    const user = userEvent.setup();
    let inputs = screen.getAllByRole("textbox");
    // Default settings
    expect(inputs[0]).toHaveValue(canonicalUrl(document).toString());
    expect(inputs[1]).toHaveValue(`<iframe src="${embedUrl(document)}" />`);
    // Customize width and height
    await user.click(screen.getByText("Customize Embed"));
    expect(screen.getByText("Width")).toBeInTheDocument();
    const radioSelections = screen.getAllByLabelText("Fixed");
    // Width
    await user.click(radioSelections[0]!);
    expect(inputs[0]).toHaveValue(canonicalUrl(document).toString());
    expect(inputs[1]).toHaveValue(
      `<iframe src="${embedUrl(document)}&width=500" width="500" />`,
    );
    // Height
    await user.click(radioSelections[1]!);
    expect(inputs[0]).toHaveValue(canonicalUrl(document).toString());
    expect(inputs[1]).toHaveValue(
      `<iframe src="${embedUrl(document)}&width=500&height=500" width="500" height="500" />`,
    );
  });
  it("disables customization of page and note embeds", async () => {
    render(Share, { document });
    const user = userEvent.setup();
    expect(screen.getByText("Customize Embed")).toBeEnabled();
    await user.click(screen.getByText("Page"));
    expect(screen.getByText("Customize Embed")).toBeDisabled();
    await user.click(screen.getByText("Note"));
    expect(screen.getByText("Customize Embed")).toBeDisabled();
    await user.click(screen.getByText("Document"));
    expect(screen.getByText("Customize Embed")).toBeEnabled();
  });
  it("disables the note tab when none are on the document", async () => {
    const docWithoutNotes = Object.assign({}, document, { notes: [] });
    expect(docWithoutNotes.notes).toEqual([]);
    render(Share, { document: docWithoutNotes });
    expect(screen.getByText("Note")).toBeDisabled();
  });
});
