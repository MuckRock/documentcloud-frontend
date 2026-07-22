import type { Nullable, User } from "$lib/api/types";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";

vi.mock("$app/state", () => ({
  page: { data: {} as { me?: Nullable<User> } },
}));

import { page } from "$app/state";
import Premium from "../Premium.svelte";
import { me, organization, proOrg, freeOrg } from "@/test/fixtures/accounts";

const premiumContent = createRawSnippet(() => ({
  render: () => `<p>Premium feature</p>`,
}));

const basicContent = createRawSnippet(() => ({
  render: () => `<p>Upgrade to unlock</p>`,
}));

describe("Premium", () => {
  it("renders premium content for an Organization-plan user", () => {
    page.data.me = { ...me, organization };

    render(Premium, {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Premium feature")).toBeInTheDocument();
    expect(screen.queryByText("Upgrade to unlock")).not.toBeInTheDocument();
  });

  it("renders premium content for a Professional-plan user", () => {
    page.data.me = { ...me, organization: proOrg };

    render(Premium, {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Premium feature")).toBeInTheDocument();
  });

  it("renders the basic fallback for a Free-plan user", () => {
    page.data.me = { ...me, organization: freeOrg };

    render(Premium, {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Upgrade to unlock")).toBeInTheDocument();
    expect(screen.queryByText("Premium feature")).not.toBeInTheDocument();
  });

  it("renders the basic fallback when signed out", () => {
    page.data.me = null;

    render(Premium, {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Upgrade to unlock")).toBeInTheDocument();
    expect(screen.queryByText("Premium feature")).not.toBeInTheDocument();
  });

  it("renders the basic fallback when the org isn't expanded (unexpanded id)", () => {
    page.data.me = { ...me, organization: organization.id };

    render(Premium, {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Upgrade to unlock")).toBeInTheDocument();
  });
});
