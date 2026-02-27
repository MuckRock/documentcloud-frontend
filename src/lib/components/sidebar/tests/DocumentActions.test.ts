import type { Document, User } from "$lib/api/types";
import { describe, it, expect } from "vitest";
import { writable, derived, type Readable } from "svelte/store";
import { render, screen } from "@testing-library/svelte";

import DocumentActions from "../DocumentActions.svelte";
import { document } from "@/test/fixtures/documents";
import { me } from "@/test/fixtures/accounts";

/** Build the context Map that DocumentActions expects. */
function makeContext({
  docs = [] as Document[],
  editAccess = false,
  user = null as User | null,
} = {}) {
  const selected = writable(docs);
  const editable: Readable<boolean> = derived(selected, ($s) =>
    editAccess ? $s.length > 0 && $s.every((d) => d.edit_access) : false,
  );

  return new Map<string, unknown>([
    ["editable", editable],
    ["selected", selected],
    ["me", writable(user)],
  ]);
}

/** Get a button by its translated label text. */
function btn(name: string) {
  return screen.getByRole("button", { name: new RegExp(name, "i") });
}

describe("DocumentActions", () => {
  it("disables all action buttons when nothing is selected", () => {
    render(DocumentActions, { context: makeContext() });

    expect(btn("Share")).toBeDisabled();
    expect(btn("Edit Metadata")).toBeDisabled();
    expect(btn("Edit Tags")).toBeDisabled();
    expect(btn("Reprocess")).toBeDisabled();
    expect(btn("Delete")).toBeDisabled();
    expect(btn("Change owner")).toBeDisabled();
  });

  it("enables Share only for a single selection", () => {
    render(DocumentActions, {
      context: makeContext({ docs: [document] }),
    });

    expect(btn("Share")).toBeEnabled();
  });

  it("disables Share when multiple documents are selected", () => {
    const second = { ...document, id: 99999 };
    render(DocumentActions, {
      context: makeContext({ docs: [document, second] }),
    });

    expect(btn("Share")).toBeDisabled();
  });

  it("enables Edit/Data/Reprocess/Delete when selection is editable", () => {
    const editableDoc = { ...document, edit_access: true };
    render(DocumentActions, {
      context: makeContext({ docs: [editableDoc], editAccess: true }),
    });

    expect(btn("Edit Metadata")).toBeEnabled();
    expect(btn("Edit Tags")).toBeEnabled();
    expect(btn("Reprocess")).toBeEnabled();
    expect(btn("Delete")).toBeEnabled();
  });

  it("disables Edit/Data/Reprocess/Delete when selection is not editable", () => {
    const readonlyDoc = { ...document, edit_access: false };
    render(DocumentActions, {
      context: makeContext({ docs: [readonlyDoc] }),
    });

    expect(btn("Edit Metadata")).toBeDisabled();
    expect(btn("Edit Tags")).toBeDisabled();
    expect(btn("Reprocess")).toBeDisabled();
    expect(btn("Delete")).toBeDisabled();
  });

  it("enables Move to Project when documents are selected", () => {
    render(DocumentActions, {
      context: makeContext({ docs: [document] }),
    });

    expect(btn("Move to Project")).toBeEnabled();
  });

  it("disables Change Owner when user does not own the documents", () => {
    render(DocumentActions, {
      context: makeContext({ docs: [document], user: me }),
    });

    // me.id (100012) !== document.user.id (20080), so Change Owner is disabled
    expect(btn("Change owner")).toBeDisabled();
  });
});
