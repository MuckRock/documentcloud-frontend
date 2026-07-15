import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte";

import ProcessContextDemo from "./ProcessContext.demo.svelte";
import { load } from "../ProcessContext.svelte";
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

// Stub the read-only `document.visibilityState` getter so tests can simulate a
// hidden or visible tab. Returns nothing — pair with `restoreVisibility()`.
function stubVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
}

function restoreVisibility() {
  delete (document as any).visibilityState;
}

describe("ProcessContext — auth-gated polling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // `load` is a module-level throttled singleton shared across tests; reset
    // it so each test starts on a fresh leading edge.
    load.cancel();
    mockPending.mockResolvedValue([]);
    mockHistory.mockResolvedValue({
      data: { results: [] },
      error: null,
    } as any);
  });

  afterEach(() => {
    restoreVisibility();
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

describe("ProcessContext — visibility-gated polling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    load.cancel();
    mockPending.mockResolvedValue([]);
    mockHistory.mockResolvedValue({
      data: { results: [] },
      error: null,
    } as any);
  });

  afterEach(() => {
    restoreVisibility();
  });

  it("does not poll when the tab is hidden, even signed in", async () => {
    stubVisibility("hidden");

    render(ProcessContextDemo, { props: { user: me } });

    // give onMount and any effects a chance to run
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockPending).not.toHaveBeenCalled();
    expect(mockHistory).not.toHaveBeenCalled();
  });

  it("triggers a fresh load when a signed-in tab returns to visible", async () => {
    stubVisibility("hidden");

    render(ProcessContextDemo, { props: { user: me } });

    // hidden: nothing polled yet
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockPending).not.toHaveBeenCalled();

    // reset the throttle so the visible poll fires on the leading edge, then
    // clear counts so we only measure the visibility-driven load
    load.cancel();
    vi.clearAllMocks();
    mockPending.mockResolvedValue([]);
    mockHistory.mockResolvedValue({
      data: { results: [] },
      error: null,
    } as any);

    stubVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    await vi.waitFor(() => {
      expect(mockPending).toHaveBeenCalledTimes(1);
      expect(mockHistory).toHaveBeenCalledTimes(1);
    });
  });

  it("does not poll on visibilitychange when signed out", async () => {
    stubVisibility("hidden");

    render(ProcessContextDemo, { props: { user: null } });

    stubVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockPending).not.toHaveBeenCalled();
    expect(mockHistory).not.toHaveBeenCalled();
  });

  it("respects the throttle window when re-entering visible", async () => {
    stubVisibility("visible");

    render(ProcessContextDemo, { props: { user: me } });

    // initial visible load from onMount
    await vi.waitFor(() => {
      expect(mockPending).toHaveBeenCalledTimes(1);
    });

    // a second visibilitychange inside the throttle window must not burst
    document.dispatchEvent(new Event("visibilitychange"));
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockPending).toHaveBeenCalledTimes(1);
  });
});
