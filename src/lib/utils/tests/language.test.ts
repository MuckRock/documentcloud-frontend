import { describe, test, expect } from "vitest";
import { getLanguage } from "../language";

// code, expected
const languages = [
  ["en", "en"],
  ["en-US", "en"],
  ["en-GB", "en"],
  ["es", "es"],
  ["--", "en"],
];

describe("language", () => {
  test("split language codes", () => {
    for (const [code, expected] of languages) {
      expect(getLanguage(code as string)).toEqual(expected);
    }
  });
});
