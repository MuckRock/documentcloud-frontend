import type { Document, Note } from "../types";

import { test, describe, expect } from "vitest";

import { BASE_API_URL } from "@/config/config.js";
import { embedUrl } from "../embed";

import * as documents from "../documents";
import * as notes from "../notes.js";

import document from "@/test/fixtures/documents/document.json";
import note from "@/test/fixtures/notes/note.json";

describe("embed tests", () => {
  test("embedUrl", () => {
    // document
    const docUrl = documents.canonicalUrl(document as Document);

    expect(embedUrl(docUrl)).toStrictEqual(
      new URL(
        `oembed/?url=${encodeURIComponent(docUrl.toString())}`,
        BASE_API_URL,
      ),
    );

    // note
    const noteUrl = notes.noteUrl(document as Document, note as Note);
    expect(embedUrl(noteUrl)).toStrictEqual(
      new URL(
        `oembed/?url=${encodeURIComponent(noteUrl.toString())}`,
        BASE_API_URL,
      ),
    );
  });
});
