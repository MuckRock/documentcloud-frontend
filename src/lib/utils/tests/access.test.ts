import { describe, it, expect } from "vitest";

import { getLevel, getLevels, VALUES } from "../access";

describe("getLevels", () => {
  it("defaults to document keys", () => {
    expect(getLevels().map((l) => l.title)).toEqual([
      "access.private.title",
      "access.organization.title",
      "access.public.title",
    ]);
  });

  it("uses note-specific keys for notes", () => {
    expect(getLevels("note").map((l) => l.title)).toEqual([
      "access.note.private.title",
      "access.note.organization.title",
      "access.note.public.title",
    ]);
  });

  it("keeps the same access values for both kinds", () => {
    expect(getLevels().map((l) => l.value)).toEqual(VALUES);
    expect(getLevels("note").map((l) => l.value)).toEqual(VALUES);
  });
});

describe("getLevel", () => {
  it("finds a level by access value", () => {
    expect(getLevel("organization")?.title).toBe("access.organization.title");
    expect(getLevel("organization", "note")?.title).toBe(
      "access.note.organization.title",
    );
  });
});
