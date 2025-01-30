import { type Writable } from "svelte/store";

export const KEY_PREFIX = "__documentcloud_";

export interface StorageManager {
  key: (subkey: string) => string;
}

/**
 * A localStorage utility class that can be
 * used to remember keyed preferences/options
 */
export class StorageManager {
  constructor(key: string) {
    this.key = (subkey) => `${KEY_PREFIX}${key}_${subkey}`;
  }

  get<R, T>(key: string, defaultValue?: T): R | T | null {
    try {
      const value = JSON.parse(localStorage.getItem(this.key(key)) ?? "null");
      if (value === null) return defaultValue ?? null;
      return value;
    } catch (e) {
      // Local storage not available
      return defaultValue ?? null;
    }
  }

  set<V>(key: string, value: V) {
    try {
      localStorage.setItem(this.key(key), JSON.stringify(value));
    } catch (e) {
      // Local storage not available
    }
  }

  remove(key: string) {
    try {
      localStorage.removeItem(this.key(key));
    } catch (e) {
      // Local storage not available
    }
  }
}

/**
 * Persist a store value to localStorage or sessionStorage.
 * This will update `store` from `key` on first load.
 */
export function saveStore<T>(
  store: Writable<T>,
  key: string,
  {
    storage = sessionStorage,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  },
) {
  if (!store || !key) return;

  const prefixedKey = `${KEY_PREFIX}${key}`;
  const saved = storage.getItem(prefixedKey);
  if (saved) {
    store.set(deserialize(saved));
  }

  return store.subscribe(($value) => {
    storage.setItem(prefixedKey, serialize($value));
  });
}
