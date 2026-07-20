import type { Nullable, Org, User } from "$lib/api/types";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { setContext } from "svelte";
import { writable } from "svelte/store";

vi.mock("$lib/api/accounts", async () => {
  const actual =
    await vi.importActual<typeof import("$lib/api/accounts")>(
      "$lib/api/accounts",
    );
  return {
    ...actual,
    userOrgs: vi.fn().mockResolvedValue([]),
    orgUsers: vi.fn().mockResolvedValue([]),
  };
});

import { userOrgs, orgUsers } from "$lib/api/accounts";
import ChangeOwner from "../ChangeOwner.svelte";
import { me } from "@/test/fixtures/accounts";
import { document } from "@/test/fixtures/documents";

const mockUserOrgs = vi.mocked(userOrgs);
const mockOrgUsers = vi.mocked(orgUsers);
const meOrg = me.organization as Org;

// https://svelte.dev/docs/svelte/context#Component-testing
function withUser(user: Nullable<User>) {
  return function Wrapper(...args: Parameters<typeof ChangeOwner>) {
    setContext("me", writable(user));
    return ChangeOwner(...args);
  };
}

function saveButton() {
  return screen.getByRole("button", { name: /save/i });
}

describe("ChangeOwner — signed-in / selection gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserOrgs.mockResolvedValue([]);
    mockOrgUsers.mockResolvedValue([]);
  });

  it("disables Save and never looks up orgs when signed out", async () => {
    render(withUser(null), { props: { documents: [document] } });

    await vi.waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(saveButton()).toBeDisabled();
    expect(mockUserOrgs).not.toHaveBeenCalled();
  });

  it("disables Save when no documents are selected, even when signed in", async () => {
    mockUserOrgs.mockResolvedValue([meOrg]);

    render(withUser(me), { props: { documents: [] } });

    await vi.waitFor(() => {
      expect(saveButton()).toBeDisabled();
    });
  });

  it("enables Save once signed in, a document is selected, and the current org resolves", async () => {
    mockUserOrgs.mockResolvedValue([meOrg]);

    render(withUser(me), { props: { documents: [document] } });

    await vi.waitFor(() => {
      expect(saveButton()).toBeEnabled();
    });
  });
});
