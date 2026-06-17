import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import SidebarGroupDemo from "./SidebarGroup.demo.svelte";

describe("SidebarGroup", () => {
  it("toggles collapsed state when the header is clicked", async () => {
    const user = userEvent.setup();
    render(SidebarGroupDemo);

    // Body is visible to start
    expect(screen.getByText("Body content")).toBeInTheDocument();

    await user.click(screen.getByText("Group title"));

    expect(screen.queryByText("Body content")).not.toBeInTheDocument();
  });

  it("does not toggle when the action link is clicked", async () => {
    const user = userEvent.setup();
    render(SidebarGroupDemo);

    expect(screen.getByText("Body content")).toBeInTheDocument();

    // Clicking the action (a link) should let it navigate, not collapse the group
    await user.click(screen.getByRole("link", { name: "Explore" }));

    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("does not stop propagation on the action click (so SvelteKit can route)", async () => {
    const user = userEvent.setup();
    render(SidebarGroupDemo);

    let reachedAncestor = false;
    // SvelteKit's client router listens on a shared ancestor (<html>); a link
    // click must reach it. Simulate that with an ancestor-level listener.
    const onAncestorClick = () => (reachedAncestor = true);
    document.documentElement.addEventListener("click", onAncestorClick);

    await user.click(screen.getByRole("link", { name: "Explore" }));

    expect(reachedAncestor).toBe(true);

    document.documentElement.removeEventListener("click", onAncestorClick);
  });
});
