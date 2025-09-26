import { test, expect } from "vitest";
import { render } from "@testing-library/svelte";
import { me as meFixture } from "@/test/fixtures/accounts";
import UserMenu from "../UserMenu.svelte";

test("UserMenu", async () => {
  let result = render(UserMenu, { user: meFixture });
  expect(result.container).toMatchSnapshot();
});
