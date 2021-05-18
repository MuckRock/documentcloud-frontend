/**
 * A localStorage utility class that can be
 * used to remember keyed preferences/options
 */

const KEY_PREFIX = "__documentcloud_";

export class StorageManager {
  constructor(key) {
    this.key = (subkey) => `${KEY_PREFIX}${key}_${subkey}`;
  }

  get(key, defaultValue) {
    try {
      const value = JSON.parse(localStorage.getItem(this.key(key)));
      if (value == null) return defaultValue;
      return value;
    } catch (e) {
      // Local storage not available
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this.key(key), JSON.stringify(value));
    } catch (e) {
      // Local storage not available
    }
  }
}
