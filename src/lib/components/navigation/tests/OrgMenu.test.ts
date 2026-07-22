import type { Org } from "$lib/api/types";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";

vi.mock("$app/navigation", () => ({ invalidateAll: vi.fn() }));

vi.mock("$lib/api/accounts", async () => {
  const actual =
    await vi.importActual<typeof import("$lib/api/accounts")>(
      "$lib/api/accounts",
    );
  return {
    ...actual,
    setOrg: vi.fn().mockResolvedValue({ data: actual, error: null }),
  };
});

import { invalidateAll } from "$app/navigation";
import { setOrg } from "$lib/api/accounts";
import OrgMenu from "../OrgMenu.svelte";
import { me, myOrgs } from "@/test/fixtures/accounts";

const mockSetOrg = vi.mocked(setOrg);
const mockInvalidateAll = vi.mocked(invalidateAll);

const activeOrg = me.organization as Org;
const otherOrg = myOrgs.results.find((org) => org.id !== activeOrg.id) as Org;

describe("OrgMenu — switching organizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PATCHes the new org and refreshes load data when another org is selected", async () => {
    document.cookie = "csrftoken=test-csrf-token";

    render(OrgMenu, {
      props: { active_org: activeOrg, orgs: [activeOrg, otherOrg], users: [] },
    });

    await fireEvent.click(screen.getByText(otherOrg.name));

    await vi.waitFor(() => {
      expect(mockSetOrg).toHaveBeenCalledWith(otherOrg.id, "test-csrf-token");
      expect(mockInvalidateAll).toHaveBeenCalled();
    });
  });

  it("does not call the API or refresh data when there's no CSRF token", async () => {
    document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC";

    render(OrgMenu, {
      props: { active_org: activeOrg, orgs: [activeOrg, otherOrg], users: [] },
    });

    await fireEvent.click(screen.getByText(otherOrg.name));
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockSetOrg).not.toHaveBeenCalled();
    expect(mockInvalidateAll).not.toHaveBeenCalled();
  });

  it("does not offer a switch when the user belongs to only one org", () => {
    render(OrgMenu, {
      props: { active_org: activeOrg, orgs: [activeOrg], users: [] },
    });

    expect(screen.queryByText(/change organization/i)).not.toBeInTheDocument();
  });
});
