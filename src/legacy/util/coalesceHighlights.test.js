import { expect, test } from "vitest";
import { coalesceHighlights } from "./coalesceHighlights.js";

test("simple coalesce", () => {
  expect(
    coalesceHighlights("this is cool", [
      [
        { type: "normal", text: "this " },
        { type: "highlight", text: "is" },
        { type: "normal", text: " cool" },
      ],
    ]),
  ).toEqual([
    { type: "normal", text: "this " },
    { type: "highlight", text: "is" },
    { type: "normal", text: " cool" },
  ]);

  // Merge spaces
  expect(
    coalesceHighlights("this is cool", [
      [
        { type: "normal", text: "this " },
        { type: "highlight", text: "is" },
        { type: "normal", text: " cool" },
      ],
      [
        { type: "highlight", text: "this" },
        { type: "normal", text: " is " },
        { type: "normal", text: "cool" },
      ],
    ]),
  ).toEqual([
    { type: "highlight", text: "this is" },
    { type: "normal", text: " cool" },
  ]);

  expect(
    coalesceHighlights("this is cool", [
      [
        { type: "normal", text: "this " },
        { type: "highlight", text: "is" },
        { type: "normal", text: " cool" },
      ],
      [
        { type: "highlight", text: "this" },
        { type: "normal", text: " " },
        { type: "normal", text: "is" },
        { type: "normal", text: " " },
        { type: "highlight", text: "cool" },
      ],
    ]),
  ).toEqual([{ type: "highlight", text: "this is cool" }]);
});
