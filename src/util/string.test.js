import { allIndices } from "./string";

test("string all indices", () => {
  expect(allIndices("the cat and the hat", "the")).toEqual([0, 12]);
});
