import type { AddOn } from "$lib/api/types";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";

import AddOnsDemo from "./AddOns.demo.svelte";
import { me } from "@/test/fixtures/accounts";
import { addon } from "@/test/fixtures/addons";

const noDocumentsAddon: AddOn = {
  ...addon,
  id: addon.id + 1,
  name: "No Documents Add-On",
  repository: "MuckRock/no-documents-addon",
  parameters: { ...addon.parameters, documents: undefined },
};

let pinned: AddOn[] = [];

vi.mock("$app/state", () => ({
  page: {
    get data() {
      return {
        me,
        pinnedAddons: Promise.resolve({ data: { results: pinned } }),
      };
    },
  },
}));

async function hrefFor(name: string): Promise<URL> {
  const link = await screen.findByRole("link", { name: new RegExp(name) });
  return new URL(link.getAttribute("href")!);
}

describe("AddOns sidebar", () => {
  beforeEach(() => {
    pinned = [addon];
  });

  it("links pinned add-ons to the last document browser query", async () => {
    render(AddOnsDemo, { documentQuery: "+project:foo-1 tax" });

    const url = await hrefFor(addon.name);
    expect(url.pathname).toBe(`/add-ons/${addon.repository}/`);
    expect(url.searchParams.get("q")).toBe("+project:foo-1 tax");
  });

  it("links pinned add-ons without a query when none has been run", async () => {
    render(AddOnsDemo);

    const url = await hrefFor(addon.name);
    expect(url.searchParams.has("q")).toBe(false);
  });

  it("omits the query from add-ons that do not process documents", async () => {
    pinned = [addon, noDocumentsAddon];
    render(AddOnsDemo, { documentQuery: "+project:foo-1 tax" });

    expect((await hrefFor(addon.name)).searchParams.get("q")).toBe(
      "+project:foo-1 tax",
    );
    expect((await hrefFor(noDocumentsAddon.name)).searchParams.has("q")).toBe(
      false,
    );
  });
});
