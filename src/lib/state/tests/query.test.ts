import type { AddOn } from "$lib/api/types";
import { describe, it, expect } from "vitest";

import { DocumentQueryState } from "$lib/state/query.svelte";
import { addon } from "@/test/fixtures/addons";

const noDocumentsAddon: AddOn = {
  ...addon,
  parameters: { ...addon.parameters, documents: undefined },
};

describe("DocumentQueryState.getAddonLink", () => {
  it("adds the query to add-ons that process documents", () => {
    const state = new DocumentQueryState();
    state.query = "+project:foo-1 tax";

    const url = new URL(state.getAddonLink(addon));
    expect(url.pathname).toBe(`/add-ons/${addon.repository}/`);
    expect(url.searchParams.get("q")).toBe("+project:foo-1 tax");
  });

  it("drops the query for add-ons that do not process documents", () => {
    const state = new DocumentQueryState();
    state.query = "+project:foo-1 tax";

    const url = new URL(state.getAddonLink(noDocumentsAddon));
    expect(url.searchParams.has("q")).toBe(false);
  });

  it("omits an empty q parameter when there is no query", () => {
    const state = new DocumentQueryState();

    const url = new URL(state.getAddonLink(addon));
    expect(url.searchParams.has("q")).toBe(false);
  });
});
