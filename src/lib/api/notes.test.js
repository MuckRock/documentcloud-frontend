import { test as base, describe, expect } from "vitest";

import { APP_URL } from "@/config/config.js";
import * as notes from "./notes.js";
import * as documents from "./documents";

const test = base.extend({
  document: async ({}, use) => {
    const doc = await import("./fixtures/documents/document.json");

    await use(doc);
  },

  note: async ({}, use) => {
    const note = await import("./fixtures/notes/note.json");

    await use(note);
  },
});

describe("fetching notes", () => {
  test.todo("notes.get");
  test.todo("notes.list");
});

describe("note helper methods", () => {
  test("canonicalNoteUrl", ({ document, note }) => {
    expect(notes.canonicalNoteUrl(document, note)).toStrictEqual(
      new URL(
        "/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/annotations/557/",
        APP_URL,
      ),
    );
  });

  test("noteUrl", ({ document, note }) => {
    expect(notes.noteUrl(document, note)).toStrictEqual(
      new URL(
        "/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/#document/p3/a557",
        APP_URL,
      ),
    );
  });

  test("width", ({ note }) => {
    expect(notes.width(note)).toStrictEqual(note.x2 - note.x1);
  });

  test("height", ({ note }) => {
    expect(notes.height(note)).toStrictEqual(note.y2 - note.y1);
  });
});
