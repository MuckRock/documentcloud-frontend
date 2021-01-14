import { timeout } from "@/util/timeout";

export async function batchDelay(collection, batchSize, delay, fn) {
  // Launch all tasks in parallel with delay
  const results = {};
  const promises = [];
  for (let i = 0; i < collection.length; i += batchSize) {
    const subCollection = collection.slice(i, i + batchSize);
    promises.push(new Promise(async (resolve) => {
      results[i] = await fn(subCollection);
      resolve();
    }));
    await timeout(delay);
  }
  await Promise.all(promises);
  // Collect results
  const orderedResults = [];
  for (const key in results) {
    if (results.hasOwnProperty(key)) {
      orderedResults.push([key, results[key]]);
    }
  }
  orderedResults.sort((a, b) => a[0] - b[0]);
  const allResults = [];
  for (let i = 0; i < orderedResults.length; i++) {
    const subResult = orderedResults[i][1];
    if (subResult == null) continue;
    for (let j = 0; j < subResult.length; j++) {
      allResults.push(orderedResults[i][1][j]);
    }
  }
  return allResults;
}


export async function batchDelaySerial(collection, batchSize, delay, fn) {
  let results = [];
  for (let i = 0; i < collection.length; i += batchSize) {
    const subCollection = collection.slice(i, i + batchSize);
    results = results.concat(await fn(subCollection));
    await timeout(delay);
  }
  return results;
}
