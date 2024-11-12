import { expect, test } from "vitest";
import { includes, intersection } from "../array";

type KeyedItem = { key: number };

function makeKeyArray(array: number[]): KeyedItem[] {
  return array.map((x) => ({ key: x }));
}

test("array includes", () => {
  expect(includes(makeKeyArray([1, 2, 3]), { key: 2 })).toBeFalsy();

  // Need a comparator
  expect(
    includes(
      makeKeyArray([1, 2, 3]),
      { key: 2 },
      (a: KeyedItem, b: KeyedItem) => a.key == b.key,
    ),
  ).toBeTruthy();
});

test("array intersection", () => {
  expect(
    intersection(
      [makeKeyArray([1, 2, 3]), makeKeyArray([2, 3, 4])],
      (a, b) => a.key == b.key,
    ),
  ).toEqual(makeKeyArray([2, 3]));

  expect(
    intersection(
      [makeKeyArray([1, 2, 3]), makeKeyArray([2, 3, 4]), makeKeyArray([5])],
      (a, b) => a.key == b.key,
    ),
  ).toEqual(makeKeyArray([]));

  expect(
    intersection(
      [
        makeKeyArray([1, 2, 3]),
        makeKeyArray([2, 3, 4]),
        makeKeyArray([4, 2, 7]),
      ],
      (a, b) => a.key == b.key,
    ),
  ).toEqual(makeKeyArray([2]));
});
