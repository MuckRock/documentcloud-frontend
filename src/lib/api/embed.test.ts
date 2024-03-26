import type { Document, Note, OEmbed } from "./types";
import { test, describe, expect } from "vitest";

import { APP_URL, BASE_API_URL } from "@/config/config.js";
import { embedUrl, getEmbed } from "./embed";

import * as documents from "./documents";
import * as notes from "./notes.js";

import document from "./fixtures/documents/document.json";
import note from "./fixtures/notes/note.json";
import oembed from "./fixtures/oembed.json";

describe("embed tests", () => {
  test("embedUrl", () => {
    // document
    const docUrl = documents.canonicalUrl(document as Document);
    expect(embedUrl(docUrl)).toStrictEqual(
      new URL(`oembed/?url=${docUrl.toString()}`, BASE_API_URL),
    );

    // note
    const noteUrl = notes.noteUrl(document as Document, note as Note);
    expect(embedUrl(noteUrl)).toStrictEqual(
      new URL(`oembed/?url=${noteUrl.toString()}`, BASE_API_URL),
    );
  });

  test.todo("getEmbed");
  /* need to sort out mocking first
  test("getEmbed", async () => {
    const url =
      "https://www.documentcloud.org/documents/282753-lefler-thesis.html";
    const result = await getEmbed(url);

    expect(result).toEqual(oembed);
  });
  */
});
