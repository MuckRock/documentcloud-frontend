import type { Nullable, User } from "$lib/api/types";

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";

vi.mock("$app/state", () => ({
  page: { data: {} as { me?: Nullable<User> } },
}));

import { page } from "$app/state";
import SignedIn from "../SignedIn.svelte";
import { me } from "@/test/fixtures/accounts";

const signedInContent = createRawSnippet(() => ({
  render: () => `<p>Welcome back</p>`,
}));

const signedOutContent = createRawSnippet(() => ({
  render: () => `<p>Please sign in</p>`,
}));

describe("SignedIn", () => {
  it("renders the signed-in content when a user is present", () => {
    page.data.me = me;

    render(SignedIn, {
      props: { children: signedInContent, signedOut: signedOutContent },
    });

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.queryByText("Please sign in")).not.toBeInTheDocument();
  });

  it("renders the signedOut fallback when there is no user", () => {
    page.data.me = null;

    render(SignedIn, {
      props: { children: signedInContent, signedOut: signedOutContent },
    });

    expect(screen.getByText("Please sign in")).toBeInTheDocument();
    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });

  it("renders nothing when signed out and no fallback is provided", () => {
    page.data.me = null;

    render(SignedIn, { props: { children: signedInContent } });

    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });
});
