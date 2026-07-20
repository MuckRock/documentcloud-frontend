import type { Nullable, User } from "$lib/api/types";

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { setContext, createRawSnippet } from "svelte";
import { writable } from "svelte/store";

import Premium from "../Premium.svelte";
import { me, organization, proOrg, freeOrg } from "@/test/fixtures/accounts";

// https://svelte.dev/docs/svelte/context#Component-testing
function withUser(user: Nullable<User>) {
  return function Wrapper(...args: Parameters<typeof Premium>) {
    setContext("me", writable(user));
    return Premium(...args);
  };
}

const premiumContent = createRawSnippet(() => ({
  render: () => `<p>Premium feature</p>`,
}));

const basicContent = createRawSnippet(() => ({
  render: () => `<p>Upgrade to unlock</p>`,
}));

describe("Premium", () => {
  it("renders premium content for an Organization-plan user", () => {
    render(withUser({ ...me, organization }), {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Premium feature")).toBeInTheDocument();
    expect(screen.queryByText("Upgrade to unlock")).not.toBeInTheDocument();
  });

  it("renders premium content for a Professional-plan user", () => {
    render(withUser({ ...me, organization: proOrg }), {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Premium feature")).toBeInTheDocument();
  });

  it("renders the basic fallback for a Free-plan user", () => {
    render(withUser({ ...me, organization: freeOrg }), {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Upgrade to unlock")).toBeInTheDocument();
    expect(screen.queryByText("Premium feature")).not.toBeInTheDocument();
  });

  it("renders the basic fallback when signed out", () => {
    render(withUser(null), {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Upgrade to unlock")).toBeInTheDocument();
    expect(screen.queryByText("Premium feature")).not.toBeInTheDocument();
  });

  it("renders the basic fallback when the org isn't expanded (unexpanded id)", () => {
    render(withUser({ ...me, organization: organization.id }), {
      props: { children: premiumContent, basic: basicContent },
    });

    expect(screen.getByText("Upgrade to unlock")).toBeInTheDocument();
  });
});
