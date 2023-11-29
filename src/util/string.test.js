import { expect, test } from "vitest";
import { allIndices, nFormatter } from "./string.js";

test("string all indices", () => {
  expect(allIndices("the cat and the hat", "the")).toEqual([0, 12]);
});

test("nFormatter", () => {
  const tests = [
    { num: 0, digits: 1, result: "0" },
    { num: 12, digits: 1, result: "12" },
    { num: 123, digits: 1, result: "123" },
    { num: 1234, digits: 1, result: "1.2K" },
    { num: 123.456, digits: 1, result: "123.5" },
    { num: 123.456, digits: 2, result: "123.46" },
    { num: 123.456, digits: 4, result: "123.456" },
    { num: 759878, digits: 0, result: "760K" },
    { num: 759878, digits: 1, result: "759.9K" },
    { num: 100000000, digits: 1, result: "100M" },
    { num: 299792458, digits: 1, result: "299.8M" },
    { num: 759878, digits: 0, result: "760K" },
  ];
  tests.forEach(function (test) {
    expect(nFormatter(test.num, test.digits)).toEqual(test.result);
  });
});
