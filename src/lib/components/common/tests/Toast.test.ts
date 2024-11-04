import { vi, describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";
import Toast from "../Toast.svelte";

describe("Toast", () => {
  it("calls close when user clicks close button", async () => {
    const user = userEvent.setup();
    const container = render(Toast, { lifespan: 1000 });
    // Spy on the "close" event
    const closeSpy = vi.fn();
    container.component.$on("close", closeSpy);
    // Click the close button
    const closeButton = container.getByRole("button");
    await user.click(closeButton);
    // Check if the "close" event was dispatched
    expect(closeSpy).toHaveBeenCalledTimes(1);
  });
});
