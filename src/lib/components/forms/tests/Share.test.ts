import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

import Share from "../Share.svelte";

import type { Access, Document } from "$lib/api/types";
import documentFixture from "@/test/fixtures/documents/document-expanded.json";
import {
  canonicalPageUrl,
  canonicalUrl,
  embedUrl,
  pageUrl,
} from "$lib/api/documents";
import { canonicalNoteUrl, noteUrl } from "$lib/api/notes";

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
    expect(inputs[1]).toHaveValue(embedUrl(document).href);
    expect((inputs[2] as HTMLInputElement).value).toContain(
      `src="${embedUrl(document)}"`,
    );
    // Page tab
    await user.click(screen.getByText("Page"));
    expect(inputs[0]).toHaveValue(pageUrl(document, 1).toString());
    expect(inputs[1]).toHaveValue(
      canonicalPageUrl(document, 1).href + "?embed=1",
    );
    expect((inputs[2] as HTMLInputElement).value).toContain(
      `<iframe src="${canonicalPageUrl(document, 1)}?embed=1"`,
    );
    // Note tab
    await user.click(screen.getByText("Note"));
    expect(inputs[0]).toHaveValue(
      noteUrl(document, document.notes?.[0]!).toString(),
    );
    expect(inputs[1]).toHaveValue(
      `${canonicalNoteUrl(document, document.notes?.[0]!)}?embed=1`,
    );
    expect((inputs[2] as HTMLInputElement).value).toContain(
      `<iframe src="${canonicalNoteUrl(document, document.notes?.[0]!)}?embed=1"`,
    );
  });
  it("allows the document embed to be customized, updating the embed URL accordingly", async () => {
    render(Share, { document });
    const user = userEvent.setup();
    let inputs = screen.getAllByRole("textbox");
    // Default settings
    expect(inputs[0]).toHaveValue(canonicalUrl(document).toString());
    expect(inputs[1]).toHaveValue(embedUrl(document).href);
    expect((inputs[2] as HTMLInputElement).value).toContain(
      `src="${embedUrl(document)}"`,
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

  describe("access warnings", () => {
    /** Replace the document's notes with a single note at `access` */
    function withNote(access: Access, edit_access = false): Document {
      const note = { ...document.notes![0]!, access, edit_access };
      return { ...document, notes: [note] };
    }

    it("warns about the document, not the note, off the note tab", () => {
      render(Share, { document: { ...document, access: "private" } });

      expect(screen.getByText("This document is private.")).toBeInTheDocument();
    });

    it("warns about a restricted note on the note tab", async () => {
      const user = userEvent.setup();
      render(Share, { document: withNote("private") });

      // the document itself is public, so nothing to warn about yet
      expect(
        screen.queryByText("This note is private."),
      ).not.toBeInTheDocument();

      await user.click(screen.getByText("Note"));

      expect(screen.getByText("This note is private.")).toBeInTheDocument();
    });

    it("describes note organization access as edit access, not org membership", async () => {
      const user = userEvent.setup();
      render(Share, { document: withNote("organization") });
      await user.click(screen.getByText("Note"));

      expect(
        screen.getByText(
          "This note is only visible to people who can edit this document.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(
          "This note is only visible within your organization.",
        ),
      ).not.toBeInTheDocument();
    });

    it("warns about the document when it is more restrictive than the note", async () => {
      const user = userEvent.setup();
      const doc = { ...withNote("organization"), access: "private" as Access };
      render(Share, { document: doc });
      await user.click(screen.getByText("Note"));

      expect(screen.getByText("This document is private.")).toBeInTheDocument();
    });

    it("offers a fix when the note is editable, even if the document isn't", async () => {
      const user = userEvent.setup();
      expect(document.edit_access).toBe(false);

      render(Share, { document: withNote("private", true) });
      await user.click(screen.getByText("Note"));

      expect(screen.getByText("Make public")).toBeInTheDocument();
    });

    it("hides the fix when the note is not editable", async () => {
      const user = userEvent.setup();
      render(Share, { document: withNote("private", false) });
      await user.click(screen.getByText("Note"));

      expect(screen.queryByText("Make public")).not.toBeInTheDocument();
    });

    it("titles the edit modal for the note, not the document", async () => {
      const user = userEvent.setup();
      render(Share, { document: withNote("private", true) });
      await user.click(screen.getByText("Note"));
      await user.click(screen.getByText("Make public"));

      expect(screen.getByText("Change note access")).toBeInTheDocument();
      expect(
        screen.queryByText("Change document access"),
      ).not.toBeInTheDocument();
      // note-specific level labels, same underlying values
      expect(screen.getByText("Collaborators")).toBeInTheDocument();
    });
  });
});
