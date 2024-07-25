import { test, expect } from "vitest";
import { StorageManager } from "../storage";

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
