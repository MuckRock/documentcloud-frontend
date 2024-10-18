/**
 * A localStorage utility class that can be
 * used to remember keyed preferences/options
 */

const KEY_PREFIX = "__documentcloud_";

export interface StorageManager {
  key: (subkey: string) => string;
}

export class StorageManager {
  constructor(key: string) {
    this.key = (subkey) => `${KEY_PREFIX}${key}_${subkey}`;
  }

  get<R, T>(key: string, defaultValue?: T): R | T | null {
    try {
      const value = JSON.parse(localStorage.getItem(this.key(key)));
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
      localStorage.removeItem(this.key(key))
    } catch (e) {
      // Local storage not available
    }
  }
}
