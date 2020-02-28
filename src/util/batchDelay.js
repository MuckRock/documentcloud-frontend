import { timeout } from "@/util/timeout";

export async function batchDelay(collection, batchSize, delay, fn) {
  let results = [];
  for (let i = 0; i < collection.length; i += batchSize) {
    const subCollection = collection.slice(i, i + batchSize);
    console.log("SUB COLLECTION", subCollection.length, i, batchSize);
    results = results.concat(await fn(subCollection));
    await timeout(delay);
  }
  return results;
}
