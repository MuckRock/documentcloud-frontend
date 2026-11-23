import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";

import EditActionsToolbar from "../EditActionsToolbar.svelte";

const names = () =>
  screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"));

describe("EditActionsToolbar", () => {
  it("offers move, rotate, duplicate and delete for a single page", () => {
    render(EditActionsToolbar, { mode: "edit" });

    expect(names()).toEqual([
      "Move up",
      "Move down",
      "Rotate counterclockwise",
      "Rotate clockwise",
      "Duplicate",
      "Delete",
    ]);
  });

  it("omits move actions in bulk mode", () => {
    render(EditActionsToolbar, { mode: "bulk" });

    expect(names()).toEqual([
      "Rotate counterclockwise",
      "Rotate clockwise",
      "Duplicate",
      "Delete",
    ]);
  });

  it("disables Move up on the first page", () => {
    render(EditActionsToolbar, { mode: "edit", first: true });

    expect(screen.getByLabelText("Move up")).toBeDisabled();
    expect(screen.getByLabelText("Move down")).toBeEnabled();
  });

  it("disables Move down on the last page", () => {
    render(EditActionsToolbar, { mode: "edit", last: true });

    expect(screen.getByLabelText("Move up")).toBeEnabled();
    expect(screen.getByLabelText("Move down")).toBeDisabled();
  });

  it("disables every action when disabled", () => {
    render(EditActionsToolbar, { mode: "bulk", disabled: true });

    screen.getAllByRole("button").forEach((b) => expect(b).toBeDisabled());
  });

  it("reports which action was clicked", async () => {
    const onEdit = vi.fn();
    render(EditActionsToolbar, { mode: "edit", onEdit });

    await fireEvent.click(screen.getByLabelText("Rotate clockwise"));
    await fireEvent.click(screen.getByLabelText("Move down"));

    expect(onEdit.mock.calls).toEqual([["cw"], ["down"]]);
  });
});
