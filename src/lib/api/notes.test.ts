import { test, describe, expect } from "vitest";

import { APP_URL } from "@/config/config.js";
import * as notes from "./notes";
import type { Document, Note } from "./types";
import document from "./fixtures/documents/document.json";
import note from "./fixtures/notes/note.json";

describe("fetching notes", () => {
  test.todo("notes.get");
  test.todo("notes.list");
});

describe("note helper methods", () => {
  const d = document as Document;
  const n = note as Note;

  test("canonicalNoteUrl", () => {
    expect(notes.canonicalNoteUrl(d, n)).toStrictEqual(
      new URL(
        "/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/annotations/557/",
        APP_URL,
      ),
    );
  });

  test("noteUrl", () => {
    expect(notes.noteUrl(d, n)).toStrictEqual(
      new URL(
        "/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/#document/p3/a557",
        APP_URL,
      ),
    );
  });

  test("noteHashUrl", () => {
    expect(notes.noteHashUrl(n)).toStrictEqual("#document/p3/a557");
  });

  test("width", () => {
    expect(notes.width(n)).toStrictEqual(n.x2 - n.x1);
  });

  test("height", () => {
    expect(notes.height(n)).toStrictEqual(n.y2 - n.y1);
  });
});
