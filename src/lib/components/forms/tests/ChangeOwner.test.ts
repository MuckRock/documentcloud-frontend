import type { Nullable, Org, User } from "$lib/api/types";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";

vi.mock("$app/state", () => ({
  page: { data: {} as { me?: Nullable<User> } },
}));

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

import { page } from "$app/state";
import { userOrgs, orgUsers } from "$lib/api/accounts";
import ChangeOwner from "../ChangeOwner.svelte";
import { me } from "@/test/fixtures/accounts";
import { document } from "@/test/fixtures/documents";

const mockUserOrgs = vi.mocked(userOrgs);
const mockOrgUsers = vi.mocked(orgUsers);
const meOrg = me.organization as Org;

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
    page.data.me = null;

    render(ChangeOwner, { props: { documents: [document] } });

    await vi.waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(saveButton()).toBeDisabled();
    expect(mockUserOrgs).not.toHaveBeenCalled();
  });

  it("disables Save when no documents are selected, even when signed in", async () => {
    page.data.me = me;
    mockUserOrgs.mockResolvedValue([meOrg]);

    render(ChangeOwner, { props: { documents: [] } });

    await vi.waitFor(() => {
      expect(saveButton()).toBeDisabled();
    });
  });

  it("enables Save once signed in, a document is selected, and the current org resolves", async () => {
    page.data.me = me;
    mockUserOrgs.mockResolvedValue([meOrg]);

    render(ChangeOwner, { props: { documents: [document] } });

    await vi.waitFor(() => {
      expect(saveButton()).toBeEnabled();
    });
  });
});
