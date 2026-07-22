import type { Nullable, Org, User } from "$lib/api/types";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";

import Documents from "../Documents.svelte";
import { me } from "@/test/fixtures/accounts";
import { savedSearch, savedSearches } from "@/test/fixtures/saved-searches";

const meOrg = me.organization as Org;

// Mock $app/state to control the page URL and the signed-in user/org
let mockQuery = "";
let mockUser: Nullable<User> = null;
let mockOrg: Nullable<Org> = null;
vi.mock("$app/state", () => ({
  page: {
    get url() {
      return new URL(
        `https://www.documentcloud.org/documents/?q=${encodeURIComponent(mockQuery)}`,
      );
    },
    get data() {
      return { me: mockUser, org: mockOrg };
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
    mockUser = me;
    mockOrg = null;
  });

  it("disables save button when query is empty", async () => {
    mockQuery = "";

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("enables save button for a new search query", async () => {
    mockQuery = "new search";

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeEnabled();
    });
  });

  it("disables save button when viewing user's own documents (presaved)", async () => {
    mockQuery = `user:${me.id}`;

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button for private documents query", async () => {
    mockQuery = `user:${me.id} access:private`;

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button for public documents query", async () => {
    mockQuery = `user:${me.id} access:public`;

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button for org documents query", async () => {
    mockQuery = `organization:${meOrg.id}`;
    mockOrg = meOrg;

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button when query has trailing space (URL-decoded +)", async () => {
    // URLSearchParams decodes bare "+" as space, so ?q=user:100012+ → "user:100012 "
    mockQuery = `user:${me.id} `;

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button when query has trailing + (matches presaved)", async () => {
    mockQuery = `user:${me.id}+`;

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button when saved search query has trailing +", async () => {
    mockQuery = savedSearch.query + "+";
    mockGetAll.mockResolvedValue(savedSearches);

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("disables save button when query matches a user-saved search", async () => {
    mockQuery = savedSearch.query;
    mockGetAll.mockResolvedValue(savedSearches);

    render(Documents);

    await vi.waitFor(() => {
      const btn = screen.getByRole("button", { name: /save current search/i });
      expect(btn).toBeDisabled();
    });
  });

  it("shows loading state initially", () => {
    mockGetAll.mockReturnValue(new Promise(() => {}));

    render(Documents);

    expect(screen.getByText(/loading saved searches/i)).toBeInTheDocument();
  });

  it("shows empty state when no saved searches exist", async () => {
    mockGetAll.mockResolvedValue([]);

    render(Documents);

    await vi.waitFor(() => {
      expect(
        screen.getByText(/your saved searches will appear here/i),
      ).toBeInTheDocument();
    });
  });

  it("renders saved search items after loading", async () => {
    mockGetAll.mockResolvedValue(savedSearches);

    render(Documents);

    await vi.waitFor(() => {
      expect(screen.getByText("Police reports")).toBeInTheDocument();
      expect(screen.getByText("FOIA requests")).toBeInTheDocument();
    });
  });

  it("does not load saved searches when signed out", async () => {
    mockUser = null;

    render(Documents);

    // give onMount a chance to run
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockGetAll).not.toHaveBeenCalled();
  });
});
