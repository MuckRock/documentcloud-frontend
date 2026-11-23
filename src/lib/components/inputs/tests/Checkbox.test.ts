import { render } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";

import Checkbox from "../Checkbox.svelte";

function submitted(defaultValue: boolean | undefined, value: boolean) {
  const { container } = render(Checkbox, { name: "flag", value, defaultValue });
  const form = document.createElement("form");
  form.append(container.querySelector("input")!);
  return new FormData(form).getAll("flag");
}

describe("Checkbox", () => {
  test.each([true, false, undefined])(
    "submits 'on' when checked with a default of %s",
    (defaultValue) => {
      expect(submitted(defaultValue, true)).toEqual(["on"]);
    },
  );

  test("submits nothing when unchecked", () => {
    expect(submitted(true, false)).toEqual([]);
  });
});
