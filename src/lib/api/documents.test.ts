import type { Document, DocumentUpload, Sizes } from "./types";

import {
  vi,
  test as base,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";
import { APP_URL, IMAGE_WIDTHS_ENTRIES } from "@/config/config.js";

import * as documents from "./documents";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  document: async ({}, use: Use<Document>) => {
    const document = await import(
      "./fixtures/documents/document-expanded.json"
    );

    await use(document as Document);
  },

  created: async ({}, use: Use<Document[]>) => {
    const { default: created } = await import(
      "./fixtures/documents/create.json"
    );

    await use(created as Document[]);
  },
});

describe("document fetching", () => {
  test.todo("documents.get");
  test.todo("documents.search");
});

describe("document uploads and processing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("documents.create", async ({ created }) => {
    const mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      async json() {
        return created;
      },
    }));

    const docs: DocumentUpload[] = created.map((d) => ({
      title: d.title,
      access: d.access,
      language: d.language,
      original_extension: d.original_extension,
    }));

    documents.create(docs, "token", mockFetch).then((d) => {
      expect(d).toMatchObject(created);
    });
  });

  test("documents.upload", async ({ created }) => {
    const mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
    }));

    created.forEach(async (doc) => {
      const file = new File(
        ["test content"],
        "finalseasonal-allergies-pollen-and-mold-2023-en.pdf",
        { type: "application/pdf" },
      );

      const resp = await documents.upload(
        new URL(doc.presigned_url),
        file,
        mockFetch,
      );

      expect(resp.ok).toBeTruthy();
    });
  });

  test("documents.process", async ({ created }) => {
    const mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      async text() {
        return "OK";
      },
    }));

    const resp = await documents.process(
      created.map((d) => ({ id: d.id })),
      "csrf_token",
      mockFetch,
    );

    expect(resp.ok).toBeTruthy();
  });

  test.todo("documents.cancel");
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
        documents.pageImageUrl(document, page, size as Sizes),
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

  test("userOrgString", async ({ document }) => {
    // user + org expanded
    expect(documents.userOrgString(document)).toStrictEqual(
      "Chris Amico (NewsHour)",
    );

    // user and org not expanded
    const d2 = (await import("./fixtures/documents/document.json")) as Document;
    expect(documents.userOrgString(d2)).toStrictEqual("");

    // user, but no org
    const d3 = { ...document, organization: 1 };
    expect(documents.userOrgString(d3)).toStrictEqual("Chris Amico");
  });

  test("pdfUrl", ({ document }) => {
    expect(documents.pdfUrl(document)).toStrictEqual(
      new URL(
        `documents/${document.id}/${document.slug}.pdf`,
        document.asset_url,
      ),
    );
  });
});
