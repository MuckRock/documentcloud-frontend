import { describe, test as base, expect } from "vitest";
import { APP_URL, IMAGE_WIDTHS_ENTRIES } from "@/config/config.js";

import * as documents from "./documents";
import type { Document, sizes } from "./types";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  document: async ({}, use: Use<Document>) => {
    const document = await import(
      "./fixtures/documents/document-expanded.json"
    );

    await use(document as unknown as Document);
  },
});

describe("document fetching", () => {
  test.todo("get a single document");

  test.todo("search documents");
});

describe("document helper methods", () => {
  test("canonicalUrl", ({ document }) => {
    expect(documents.canonicalUrl(document)).toStrictEqual(
      new URL(`/documents/${document.id}-${document.slug}/`, APP_URL),
    );
  });

  test("canonicalPageUrl", ({ document }) => {
    expect(documents.canonicalPageUrl(document, 1)).toStrictEqual(
      new URL(`/documents/${document.id}/pages/1/`, APP_URL),
    );
  });

  test("pageHashUrl", ({ document }) => {
    expect(documents.pageHashUrl(1)).toStrictEqual(`#document/p1`);
  });

  test("pageUrl", ({ document }) => {
    expect(documents.pageUrl(document, 1)).toStrictEqual(
      new URL(
        `/documents/${document.id}-${document.slug}/#document/p1`,
        APP_URL,
      ),
    );
  });

  test("pageImageUrl", ({ document }) => {
    const page = 1;
    IMAGE_WIDTHS_ENTRIES.forEach(([size, width]) => {
      expect(
        documents.pageImageUrl(document, page, size as sizes),
      ).toStrictEqual(
        new URL(
          `documents/${document.id}/pages/${document.slug}-p${page}-${size}.gif`,
          document.asset_url,
        ),
      );
    });
  });

  test("textUrl", ({ document }) => {
    expect(documents.textUrl(document, 1)).toStrictEqual(
      new URL(
        `documents/${document.id}/pages/${document.slug}-p1.txt`,
        document.asset_url,
      ),
    );
  });

  test("jsonUrl", ({ document }) => {
    expect(documents.jsonUrl(document)).toStrictEqual(
      new URL(
        `documents/${document.id}/${document.slug}.txt.json`,
        document.asset_url,
      ),
    );
  });

  test("selectableTextUrl", ({ document }) => {
    expect(documents.selectableTextUrl(document, 1)).toStrictEqual(
      new URL(
        `documents/${document.id}/pages/${document.slug}-p1.position.json`,
        document.asset_url,
      ),
    );
  });

  test.todo("userOrgString");
  test.todo("pdfUrl");
});
