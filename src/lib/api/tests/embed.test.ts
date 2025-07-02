import { test, describe, expect } from "vitest";

import { BASE_API_URL, EMBED_URL } from "@/config/config.js";
import { embedUrl } from "../embed";

import * as documents from "../documents";
import * as notes from "../notes";
import * as embed from "../embed";

import { document } from "@/test/fixtures/documents";
import { note } from "@/test/fixtures/notes";
import { project } from "@/test/fixtures/projects";

describe("embed tests", () => {
  test("embedUrl", () => {
    // document
    const docUrl = documents.canonicalUrl(document);

    expect(embedUrl(docUrl)).toStrictEqual(
      new URL(
        `oembed/?url=${encodeURIComponent(docUrl.toString())}`,
        BASE_API_URL,
      ),
    );

    // note
    const noteUrl = notes.noteUrl(document, note);
    expect(embedUrl(noteUrl)).toStrictEqual(
      new URL(
        `oembed/?url=${encodeURIComponent(noteUrl.toString())}`,
        BASE_API_URL,
      ),
    );
  });

  test("document embed", () => {
    const iframe = embed.document(document, new URLSearchParams());
    const result = `<iframe src="${EMBED_URL}documents/24002098-quarterly-reports-created-pursuant-to-the-letter-from-the-national-archives-and-records-administration-dated-june-1-2018/?embed=1" width="612" height="792" style="border: 1px solid #d8dee2; border-radius: 0.5rem; width: 100%; height: 100%; aspect-ratio: 612 / 792"></iframe>`;

    expect(iframe).toEqual(result);
  });

  test("page embed", () => {
    const iframe = embed.page(document, 1);
    const result = `<iframe src="${EMBED_URL}documents/24002098/pages/1/?embed=1" width="612" height="792" style="border: none; width: 100%; height: 100%; aspect-ratio: 612 / 792"></iframe>
<script defer src="${EMBED_URL}embed/resize.js"></script>`;

    expect(iframe).toEqual(result);
  });

  test("note embed", () => {
    const iframe = embed.note(document, note);
    const result = `<iframe src="${EMBED_URL}documents/24002098/annotations/557/?embed=1" width="366.32571428571424" height="15.19097387173396" style="border: 1px solid #d8dee2; border-radius: 0.5rem; width: 100%; height: 100%; aspect-ratio: 366.32571428571424 / 15.19097387173396;"></iframe>
<script defer src="${EMBED_URL}embed/resize.js"></script>`;

    expect(iframe).toEqual(result);
  });

  test("project embed", () => {
    const iframe = embed.project(project);
    const result = `<iframe src="${EMBED_URL}projects/215178-ocr-reprise/?embed=1" width="100%" height="600px"></iframe>`;

    expect(iframe).toEqual(result);
  });
});
