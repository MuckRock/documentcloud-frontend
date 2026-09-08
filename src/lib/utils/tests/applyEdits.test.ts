import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";

import { applyEdits } from "../applyEdits";
import { edited, DEFAULT_EXPAND } from "$lib/api/documents";
import type { Document } from "$lib/api/types";

beforeEach(() => {
  edited.set(new Map());
});

describe("applyEdits", () => {
  it("stores a single document under its id", () => {
    applyEdits({ id: 1, title: "a" } as Partial<Document>);

    expect(get(edited).get("1")).toStrictEqual({ title: "a" });
  });

  it("stores each document in an array under its own id", () => {
    applyEdits([
      { id: 1, title: "a" },
      { id: 2, title: "b" },
    ] as Partial<Document>[]);

    const m = get(edited);
    expect(m.get("1")).toStrictEqual({ title: "a" });
    expect(m.get("2")).toStrictEqual({ title: "b" });
  });

  it("does not store the id itself", () => {
    applyEdits({ id: 1, title: "a" } as Partial<Document>);

    expect(get(edited).get("1")).not.toHaveProperty("id");
  });

  it("merges new edits with existing ones, with new values winning", () => {
    applyEdits({ id: 1, title: "a" } as Partial<Document>);
    applyEdits({ id: 1, access: "public" } as Partial<Document>);

    expect(get(edited).get("1")).toStrictEqual({
      title: "a",
      access: "public",
    });

    applyEdits({ id: 1, title: "b" } as Partial<Document>);

    expect(get(edited).get("1")).toStrictEqual({
      title: "b",
      access: "public",
    });
  });

  it("strips expandable fields by default", () => {
    const document = { id: 1, title: "a" } as Partial<Document>;
    DEFAULT_EXPAND.forEach((field) => {
      (document as Record<string, unknown>)[field] = `${field}-value`;
    });

    applyEdits(document);

    const stored = get(edited).get("1");
    expect(stored).toStrictEqual({ title: "a" });
    DEFAULT_EXPAND.forEach((field) => {
      expect(stored).not.toHaveProperty(field);
    });
  });

  it("keeps expandable fields when stripExpandable is false", () => {
    const document = { id: 1, title: "a" } as Partial<Document>;
    DEFAULT_EXPAND.forEach((field) => {
      (document as Record<string, unknown>)[field] = `${field}-value`;
    });

    applyEdits(document, false);

    const stored = get(edited);
    expect(stored.get("1")).toStrictEqual({
      title: "a",
      ...Object.fromEntries(DEFAULT_EXPAND.map((f) => [f, `${f}-value`])),
    });
  });

  it("is a no-op when called with no documents", () => {
    applyEdits({ id: 1, title: "a" } as Partial<Document>);
    const before = new Map(get(edited));

    applyEdits();

    expect(get(edited)).toStrictEqual(before);
  });

  it("is a no-op when called with an empty array", () => {
    applyEdits({ id: 1, title: "a" } as Partial<Document>);
    const before = new Map(get(edited));

    applyEdits([]);

    expect(get(edited)).toStrictEqual(before);
  });

  it("coerces numeric and string ids to the same key", () => {
    applyEdits({ id: 1, title: "a" } as Partial<Document>);
    applyEdits({ id: "1", access: "public" } as unknown as Partial<Document>);

    const m = get(edited);
    expect(m.size).toBe(1);
    expect(m.get("1")).toStrictEqual({ title: "a", access: "public" });
  });
});
