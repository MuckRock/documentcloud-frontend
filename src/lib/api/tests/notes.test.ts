import { afterEach, vi, test as base, describe, expect } from "vitest";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";

import * as notes from "../notes";
import type { Document, Note, NoteResults } from "../types";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  async document({}, use: Use<Document>) {
    const document = await import(
      "@/test/fixtures/documents/document-expanded.json"
    );

    await use(document as Document);
  },

  async note({}, use: Use<Note>) {
    const note = await import("@/test/fixtures/notes/note-expanded.json");

    await use(note as Note);
  },

  async noteList({}, use: Use<NoteResults>) {
    const list = await import("@/test/fixtures/notes/notes-expanded.json");

    await use(list as NoteResults);
  },
});

const csrf_token = "token";

describe("reading notes", () => {
  test.todo("notes.get");
  test.todo("notes.list");
});

describe("writing notes", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("notes.create", async ({ document, note }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 201,
        async json() {
          return note;
        },
      };
    });

    const result = await notes.create(document.id, note, "token", mockFetch);

    expect(result).toEqual(note);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/notes/`, BASE_API_URL),
      {
        body: JSON.stringify(note),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf_token,
          Referer: APP_URL,
        },
        method: "POST",
      },
    );
  });

  test("notes.update", async ({ document, note }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      const update = JSON.parse(options.body);

      return {
        ok: true,
        status: 200,
        async json() {
          return { ...note, ...update };
        },
      };
    });

    const update: Partial<Note> = { title: "New title" };

    const result = await notes.update(
      document.id,
      note.id,
      update,
      csrf_token,
      mockFetch,
    );

    expect(result).toMatchObject({ ...note, ...update });
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/notes/${note.id}/`, BASE_API_URL),
      {
        body: JSON.stringify(update),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf_token,
          Referer: APP_URL,
        },
        method: "PATCH",
      },
    );
  });

  test("notes.remove", async ({ document, note }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 204,
      };
    });

    const resp = await notes.remove(
      document.id,
      note.id,
      csrf_token,
      mockFetch,
    );

    expect(resp.status).toStrictEqual(204);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/notes/${note.id}/`, BASE_API_URL),
      {
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: csrf_token,
          Referer: APP_URL,
        },
        method: "DELETE",
      },
    );
  });
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

  test("noteHashUrl", ({ note }) => {
    expect(notes.noteHashUrl(note)).toStrictEqual("#document/p3/a557");
  });

  test("noteFromHash", ({ note }) => {
    const hash = notes.noteHashUrl(note);

    expect(notes.noteFromHash(hash)).toStrictEqual(note.id);
  });

  test("width", ({ note }) => {
    expect(notes.width(note)).toStrictEqual(note.x2 - note.x1);
  });

  test("height", ({ note }) => {
    expect(notes.height(note)).toStrictEqual(note.y2 - note.y1);
  });

  test("isPageLevel", ({ note }) => {
    const copy: Note = { ...note, x1: null, x2: null, y1: null, y2: null };

    expect(notes.isPageLevel(copy)).toBeTruthy();
    expect(notes.isPageLevel(note)).toBeFalsy();
  });
});
