import { test, expect } from "vitest";
import { render } from "@testing-library/svelte";

import AddOnListItem from "../AddOnListItem.svelte";
import { addon, premiumAddon } from "@/test/fixtures/addons";

test("AddOnListItem", () => {
  const result = render(AddOnListItem, { addon });
  expect(result.getByRole("heading")).toHaveTextContent(addon.name);
  expect(result.container).toMatchSnapshot();
  const premium = render(AddOnListItem, { addon: premiumAddon });
  expect(premium.getByRole("status")).toHaveTextContent("Premium");
  expect(premium.container).toMatchSnapshot();
});
