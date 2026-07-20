import type { Nullable, User } from "$lib/api/types";

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { setContext, createRawSnippet } from "svelte";
import { writable } from "svelte/store";

import SignedIn from "../SignedIn.svelte";
import { me } from "@/test/fixtures/accounts";

// https://svelte.dev/docs/svelte/context#Component-testing
function withUser(user: Nullable<User>) {
  return function Wrapper(...args: Parameters<typeof SignedIn>) {
    setContext("me", writable(user));
    return SignedIn(...args);
  };
}

const signedInContent = createRawSnippet(() => ({
  render: () => `<p>Welcome back</p>`,
}));

const signedOutContent = createRawSnippet(() => ({
  render: () => `<p>Please sign in</p>`,
}));

describe("SignedIn", () => {
  it("renders the signed-in content when a user is present", () => {
    render(withUser(me), {
      props: { children: signedInContent, signedOut: signedOutContent },
    });

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.queryByText("Please sign in")).not.toBeInTheDocument();
  });

  it("renders the signedOut fallback when there is no user", () => {
    render(withUser(null), {
      props: { children: signedInContent, signedOut: signedOutContent },
    });

    expect(screen.getByText("Please sign in")).toBeInTheDocument();
    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });

  it("renders nothing when signed out and no fallback is provided", () => {
    render(withUser(null), { props: { children: signedInContent } });

    expect(screen.queryByText("Welcome back")).not.toBeInTheDocument();
  });
});
