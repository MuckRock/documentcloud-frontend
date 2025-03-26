import { beforeEach, describe, test, expect } from "vitest";
import { get, writable, type Writable } from "svelte/store";
import { StorageManager, saveStore, KEY_PREFIX } from "../storage";

const key = "TEST_KEY";

describe("storage tests", () => {
  beforeEach(() => {
    sessionStorage.removeItem(key);
  });

  test("StorageManager", () => {
    const s = new StorageManager("settings");
    expect(s.key("property")).toEqual("__documentcloud_settings_property");
    s.set("property", 12345);
    expect(s.get("property")).toEqual(12345);
    expect(s.get("unsetProp", 67890)).toEqual(67890);
    expect(s.get("unsetProp")).toBeNull();
    s.remove("property");
    expect(s.get("property")).toBeNull();
  });

  test("saveStore", () => {
    const store: Writable<number[]> = writable([1, 2, 3]);

    // save it
    saveStore(store, key, { storage: sessionStorage });

    store.set([4, 5, 6]);

    const saved = JSON.parse(
      sessionStorage.getItem(`${KEY_PREFIX}${key}`) ?? "",
    );

    expect(saved).toEqual([4, 5, 6]);
  });

  test("saveStore restore", () => {
    // set initial value
    sessionStorage.setItem(`${KEY_PREFIX}${key}`, JSON.stringify([1, 2, 3]));

    const store: Writable<number[]> = writable([]);

    saveStore(store, key, { storage: sessionStorage });

    expect(get(store)).toEqual([1, 2, 3]);
  });
});
