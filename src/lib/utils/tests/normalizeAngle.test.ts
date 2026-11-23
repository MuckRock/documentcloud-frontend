import { describe, expect, it } from "vitest";

import { normalizeAngle } from "../normalizeAngle";

describe("normalizeAngle", () => {
  it.each([
    [0, 0],
    [90, 90],
    [360, 0],
    [450, 90],
    [-90, 270],
    [-360, 0],
    [-450, 270],
  ])("normalizes %i degrees to %i", (input, expected) => {
    // `+ 0` folds -0 into 0, which toBe treats as distinct.
    expect(normalizeAngle(input) + 0).toBe(expected);
  });
});
