import { describe, test, it, expect } from "vitest";
import { render } from "@testing-library/svelte";

import AddOnListItem from "./AddOnListItem.demo.svelte";
import { addon, premiumAddon } from "@/test/fixtures/addons";

test("AddOnListItem", () => {
  const result = render(AddOnListItem, { addon });
  expect(result.getByRole("heading").textContent).toEqual(addon.name);
  expect(result.container).toMatchSnapshot();
  const premium = render(AddOnListItem, { addon: premiumAddon });
  expect(premium.getByRole("status").textContent).toContain("Premium");
  expect(premium.container).toMatchSnapshot();
});

describe("AddOnListItem link", () => {
  it("carries the last document browser query to the add-on page", () => {
    const result = render(AddOnListItem, {
      addon,
      documentQuery: "+document:123",
    });

    const link = result.getByRole("link", { name: addon.name });
    const url = new URL(link.getAttribute("href")!);
    expect(url.pathname).toBe(`/add-ons/${addon.repository}/`);
    expect(url.searchParams.get("q")).toBe("+document:123");
  });

  it("links without a query before any search has run", () => {
    const result = render(AddOnListItem, { addon });

    const link = result.getByRole("link", { name: addon.name });
    expect(new URL(link.getAttribute("href")!).searchParams.has("q")).toBe(
      false,
    );
  });
});
