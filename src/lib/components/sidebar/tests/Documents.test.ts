import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";

import DocumentsDemo from "./Documents.demo.svelte";
import { me } from "@/test/fixtures/accounts";
import { savedSearch, savedSearches } from "@/test/fixtures/saved-searches";
import type { Org } from "$lib/api/types";

const meOrg = me.organization as Org;

// Mock $app/state to control the page URL
let mockQuery = "";
vi.mock("$app/state", () => ({
  page: {
    get url() {
      return new URL(`https://www.documentcloud.org/documents/?q=${encodeURIComponent(mockQuery)}`);
    },
  },
}));

// Mock the saved searches API
vi.mock("$lib/api/saved-searches", () => ({
  listAll: vi.fn().mockResolvedValue([]),
}));

import { listAll } from "$lib/api/saved-searches";
const mockGetAll = vi.mocked(listAll);

describe("Documents sidebar — saved search detection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetAll.mockResolvedValue([]);
    mockQuery = "";
  });

  it("disables save button when query is empty", async () => {
    mockQuery = "";

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("enables save button for a new search query", async () => {
    mockQuery = "new search";

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeEnabled();
    });
  });

  it("disables save button when viewing user's own documents (presaved)", async () => {
    mockQuery = `user:${me.id}`;

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button for private documents query", async () => {
    mockQuery = `user:${me.id} access:private`;

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button for public documents query", async () => {
    mockQuery = `user:${me.id} access:public`;

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button for org documents query", async () => {
    mockQuery = `organization:${meOrg.id}`;

    render(DocumentsDemo, {
      props: {
        user: me,
        org: meOrg,
      },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button when query has trailing space (URL-decoded +)", async () => {
    // URLSearchParams decodes bare "+" as space, so ?q=user:100012+ → "user:100012 "
    mockQuery = `user:${me.id} `;

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button when query has trailing + (matches presaved)", async () => {
    mockQuery = `user:${me.id}+`;

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button when saved search query has trailing +", async () => {
    mockQuery = savedSearch.query + "+";
    mockGetAll.mockResolvedValue(savedSearches);

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button when query matches a user-saved search", async () => {
    mockQuery = savedSearch.query;
    mockGetAll.mockResolvedValue(savedSearches);

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("shows loading state initially", () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));

    render(DocumentsDemo, {
      props: { user: me },
    });

    expect(screen.getByText(/loading saved searches/i)).toBeInTheDocument();
  });

  it("shows empty state when no saved searches exist", async () => {
    mockGetAll.mockResolvedValue([]);

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      expect(
        screen.getByText(/your saved searches will appear here/i),
      ).toBeInTheDocument();
    });
  });

  it("renders saved search items after loading", async () => {
    mockGetAll.mockResolvedValue(savedSearches);

    render(DocumentsDemo, {
      props: { user: me },
    });

    await vi.waitFor(() => {
      expect(screen.getByText("Police reports")).toBeInTheDocument();
      expect(screen.getByText("FOIA requests")).toBeInTheDocument();
    });
  });
});
