import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";

import DocumentActionsDemo from "./DocumentActions.demo.svelte";
import { document } from "@/test/fixtures/documents";
import { me } from "@/test/fixtures/accounts";

/** Get a button by its translated label text. */
function btn(name: string) {
  return screen.getByRole("button", { name: new RegExp(name, "i") });
}

describe("DocumentActions", () => {
  it("disables all action buttons when nothing is selected", () => {
    render(DocumentActionsDemo);

    expect(btn("Share")).toBeDisabled();
    expect(btn("Edit Metadata")).toBeDisabled();
    expect(btn("Edit Tags")).toBeDisabled();
    expect(btn("Reprocess")).toBeDisabled();
    expect(btn("Delete")).toBeDisabled();
    expect(btn("Change owner")).toBeDisabled();
  });

  it("enables Share only for a single selection", () => {
    render(DocumentActionsDemo, {
      props: { docs: [document] },
    });

    expect(btn("Share")).toBeEnabled();
  });

  it("disables Share when multiple documents are selected", () => {
    const second = { ...document, id: 99999 };
    render(DocumentActionsDemo, {
      props: { docs: [document, second] },
    });

    expect(btn("Share")).toBeDisabled();
  });

  it("enables Edit/Data/Reprocess/Delete when selection is editable", () => {
    const editableDoc = { ...document, edit_access: true };
    render(DocumentActionsDemo, {
      props: { docs: [editableDoc] },
    });

    expect(btn("Edit Metadata")).toBeEnabled();
    expect(btn("Edit Tags")).toBeEnabled();
    expect(btn("Reprocess")).toBeEnabled();
    expect(btn("Delete")).toBeEnabled();
  });

  it("disables Edit/Data/Reprocess/Delete when selection is not editable", () => {
    const readonlyDoc = { ...document, edit_access: false };
    render(DocumentActionsDemo, {
      props: { docs: [readonlyDoc] },
    });

    expect(btn("Edit Metadata")).toBeDisabled();
    expect(btn("Edit Tags")).toBeDisabled();
    expect(btn("Reprocess")).toBeDisabled();
    expect(btn("Delete")).toBeDisabled();
  });

  it("enables Move to Project when documents are selected", () => {
    render(DocumentActionsDemo, {
      props: { docs: [document] },
    });

    expect(btn("Move to Project")).toBeEnabled();
  });

  it("disables Change Owner when user does not own the documents", () => {
    render(DocumentActionsDemo, {
      props: { docs: [document], user: me },
    });

    // me.id (100012) !== document.user.id (20080), so Change Owner is disabled
    expect(btn("Change owner")).toBeDisabled();
  });
});
