import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/svelte";

import ProcessContextDemo from "./ProcessContext.demo.svelte";
import { me } from "@/test/fixtures/accounts";

// ProcessContext calls invalidate() from $app/navigation in its $effect
vi.mock("$app/navigation", () => ({
  invalidate: vi.fn(),
}));

// Mock the polling endpoints so we can assert whether they get hit
vi.mock("$lib/api/documents", () => ({
  pending: vi.fn().mockResolvedValue([]),
}));

vi.mock("$lib/api/addons", () => ({
  history: vi.fn().mockResolvedValue({ data: { results: [] }, error: null }),
}));

import { pending } from "$lib/api/documents";
import { history } from "$lib/api/addons";

const mockPending = vi.mocked(pending);
const mockHistory = vi.mocked(history);

describe("ProcessContext — auth-gated polling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPending.mockResolvedValue([]);
    mockHistory.mockResolvedValue({
      data: { results: [] },
      error: null,
    } as any);
  });

  it("polls pending documents and addon runs when signed in", async () => {
    render(ProcessContextDemo, { props: { user: me } });

    await vi.waitFor(() => {
      expect(mockPending).toHaveBeenCalled();
      expect(mockHistory).toHaveBeenCalled();
    });
  });

  it("does not poll when signed out", async () => {
    render(ProcessContextDemo, { props: { user: null } });

    // give onMount and any effects a chance to run
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockPending).not.toHaveBeenCalled();
    expect(mockHistory).not.toHaveBeenCalled();
  });
});
