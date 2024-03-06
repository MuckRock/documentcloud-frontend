import { test, describe, expect } from "vitest";

import { APP_URL, BASE_API_URL } from "@/config/config.js";
import { embedUrl, getEmbed } from "./embed.js";

import * as documents from "./documents";
import * as notes from "./notes.js";

import document from "./fixtures/documents/document.json";
import note from "./fixtures/notes/note.json";

describe("embed tests", () => {
  test("embedUrl", () => {
    // document
    const docUrl = documents.canonicalUrl(document);
    expect(embedUrl(docUrl)).toStrictEqual(
      new URL(`oembed/?url=${docUrl.toString()}`, BASE_API_URL),
    );

    // note
    const noteUrl = notes.noteUrl(document, note);
    expect(embedUrl(noteUrl)).toStrictEqual(
      new URL(`oembed/?url=${noteUrl.toString()}`, BASE_API_URL),
    );
  });

  test.todo("getEmbed");
});
