import { test, expect } from "vitest";
import { render } from "@testing-library/svelte";
import Mailkey from "../Mailkey.svelte";

test("Mailkey", () => {
  let result = render(Mailkey);
  expect(result.container).toMatchSnapshot();
  result = render(Mailkey, {message: 'Something happened'});
  expect(result.container).toMatchSnapshot();
});
