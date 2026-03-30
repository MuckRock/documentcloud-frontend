import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

import SavedSearchFormDemo from "./SavedSearchForm.demo.svelte";
import { savedSearch } from "@/test/fixtures/saved-searches";

// Mock the API module
vi.mock("$lib/api/saved-searches", () => ({
  create: vi.fn(),
  update: vi.fn(),
  destroy: vi.fn(),
}));

// Mock getCsrfToken
vi.mock("$lib/utils/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/utils/api")>();
  return {
    ...actual,
    getCsrfToken: () => "test-csrf",
  };
});

import * as api from "$lib/api/saved-searches";

const mockCreate = vi.mocked(api.create);
const mockUpdate = vi.mocked(api.update);
const mockDestroy = vi.mocked(api.destroy);

describe("SavedSearchForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders create form with initial query", () => {
    render(SavedSearchFormDemo, {
      props: { initialQuery: "police report" },
    });

    const nameInput = screen.getByRole("textbox", { name: /name/i });
    const queryInput = screen.getByRole("textbox", { name: /search query/i });

    expect(nameInput).toHaveValue("");
    expect(queryInput).toHaveValue("police report");
  });

  it("renders edit form with saved search data", () => {
    render(SavedSearchFormDemo, {
      props: { savedSearch },
    });

    const nameInput = screen.getByRole("textbox", { name: /name/i });
    const queryInput = screen.getByRole("textbox", { name: /search query/i });

    expect(nameInput).toHaveValue(savedSearch.name);
    expect(queryInput).toHaveValue(savedSearch.query);
  });

  it("calls create on submit for new search", async () => {
    const onsave = vi.fn();
    const created = { ...savedSearch, uuid: "new-uuid" };
    mockCreate.mockResolvedValue({ data: created });

    render(SavedSearchFormDemo, {
      props: { initialQuery: "test query", onsave },
    });

    const user = userEvent.setup();
    const nameInput = screen.getByRole("textbox", { name: /name/i });
    await user.type(nameInput, "My Search");

    const submitBtn = screen.getByRole("button", { name: /save/i });
    await user.click(submitBtn);

    expect(mockCreate).toHaveBeenCalledWith(
      { name: "My Search", query: "test query" },
      "test-csrf",
    );
    expect(onsave).toHaveBeenCalledWith(created);
  });

  it("calls update on submit for existing search", async () => {
    const onsave = vi.fn();
    const updated = { ...savedSearch, name: "Updated" };
    mockUpdate.mockResolvedValue({ data: updated });

    render(SavedSearchFormDemo, {
      props: { savedSearch, onsave },
    });

    const user = userEvent.setup();
    const nameInput = screen.getByRole("textbox", { name: /name/i });
    await user.clear(nameInput);
    await user.type(nameInput, "Updated");

    const submitBtn = screen.getByRole("button", { name: /^save$/i });
    await user.click(submitBtn);

    expect(mockUpdate).toHaveBeenCalledWith(
      savedSearch.uuid,
      { name: "Updated", query: savedSearch.query },
      "test-csrf",
    );
    expect(onsave).toHaveBeenCalledWith(updated);
  });

  it("shows delete button only for existing searches", () => {
    const { unmount } = render(SavedSearchFormDemo, {
      props: { initialQuery: "new" },
    });

    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();

    unmount();

    render(SavedSearchFormDemo, {
      props: { savedSearch },
    });

    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("requires confirmation before deleting", async () => {
    const ondelete = vi.fn();
    mockDestroy.mockResolvedValue({});

    render(SavedSearchFormDemo, {
      props: { savedSearch, ondelete },
    });

    const user = userEvent.setup();

    // First click shows confirmation
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteBtn);

    // Now confirm
    const confirmBtn = screen.getByRole("button", {
      name: /really delete/i,
    });
    await user.click(confirmBtn);

    expect(mockDestroy).toHaveBeenCalledWith(savedSearch.uuid, "test-csrf");
    expect(ondelete).toHaveBeenCalledWith(savedSearch.uuid);
  });

  it("displays error from API on create failure", async () => {
    mockCreate.mockResolvedValue({
      error: { status: 400, message: "Bad Request" },
    });

    render(SavedSearchFormDemo, {
      props: { initialQuery: "test" },
    });

    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox", { name: /name/i }), "Test");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText(/bad request/i)).toBeInTheDocument();
  });

  it("displays error from API on delete failure", async () => {
    mockDestroy.mockResolvedValue({
      error: { status: 404, message: "Not Found" },
    });

    render(SavedSearchFormDemo, {
      props: { savedSearch },
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /really delete/i }));

    expect(await screen.findByText(/not found/i)).toBeInTheDocument();
  });
});
