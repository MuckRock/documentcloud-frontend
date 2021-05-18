import { batchDelay } from "./batchDelay";
import { timeout } from "@/util/timeout";

const timeShrink = 5;

test("batch delay works", async () => {
  const expected = [1000 / timeShrink, 3000 / timeShrink, 1000 / timeShrink];
  const results = await batchDelay(
    expected,
    1,
    1000 / timeShrink,
    async (x) => {
      await timeout(x[0]);
      return [x[0] * 2];
    },
  );
  expect(results).toEqual(expected.map((x) => x * 2));
});
