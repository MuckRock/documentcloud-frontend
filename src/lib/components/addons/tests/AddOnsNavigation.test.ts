import { test, expect } from "vitest";
import { render } from "@testing-library/svelte";
import AddOnsNavigation from "../AddOnsNavigation.svelte";

test("AddOnsNavigation", () => {
  const result = render(AddOnsNavigation);
  expect(result.container).toMatchSnapshot();
});
