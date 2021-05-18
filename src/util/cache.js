/**
 * Utility wrappers to cache function results
 */

import deepEqual from "fast-deep-equal";

function findFromCache(cache, args) {
  for (let i = 0; i < cache.length; i++) {
    const cacheEntry = cache[i];
    if (deepEqual(cacheEntry[0], args)) {
      return [true, cacheEntry[1]];
    }
  }
  return [false];
}

export function cache(fn, cacheSize = 50) {
  const cache = [];

  return (...args) => {
    // Check for entry in cache
    const cacheResult = findFromCache(cache, args);
    if (cacheResult[0]) return cacheResult[1];

    // Not found, run the function
    const result = fn(...args);

    // Set the cache
    cache.push([args, result]);
    while (cache.length > cacheSize) {
      cache.shift();
    }

    return result;
  };
}

export function cacheAsync(fn, cacheSize = 20) {
  const cache = [];

  return async (...args) => {
    // Check for entry in cache
    const cacheResult = findFromCache(cache, args);
    if (cacheResult[0]) {
      return cacheResult[1];
    }

    // Not found, run the function
    const result = await fn(...args);

    // Set the cache
    cache.push([args, result]);
    while (cache.length > cacheSize) {
      cache.shift();
    }

    return result;
  };
}
