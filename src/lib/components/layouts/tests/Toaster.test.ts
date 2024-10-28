import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import Toaster, { toasts, toast } from "../Toaster.svelte";
import { get } from "svelte/store";

describe("toast", () => {
  beforeEach(() => {
    // Reset the toasts store before each test
    toasts.set([]);
    // Mock Date.now() to return a fixed timestamp
    vi.spyOn(Date, "now").mockReturnValue(1620000000000); // Mocked timestamp
  });

  afterEach(() => {
    // Restore the original Date.now() method
    vi.restoreAllMocks();
  });

  it("adds a datestamp ID to the notification", () => {
    // Call the toast function
    toast("Hello world");
    // Get the notifications from the store
    const current = get(toasts);
    // Check that the notification has been added with the correct ID
    expect(current).toHaveLength(1);
    expect(current[0]?.id).toBe(1620000000000);
    expect(current[0]?.contents).toBe("Hello world");
  });
});

describe("Toaster", () => {
  beforeEach(() => {
    // Reset the toasts store before each test
    toasts.set([]);
  });

  it("renders toasts that are sent", async () => {
    render(Toaster);
    expect(screen.queryByRole("dialog")).toBeNull();
    toast("Hello world", { lifespan: 0 });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeNull();
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });
  });
});
