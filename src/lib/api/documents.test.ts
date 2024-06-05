import type {
  Document,
  DocumentText,
  DocumentUpload,
  Pending,
  Sizes,
  TextPosition,
} from "./types";

import { vi, test as base, describe, expect, afterEach } from "vitest";
import {
  APP_URL,
  BASE_API_URL,
  DC_BASE,
  IMAGE_WIDTHS_ENTRIES,
} from "@/config/config.js";

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

  pending: async ({}, use: Use<Pending[]>) => {
    const { default: pending } = await import(
      "./fixtures/documents/pending.json"
    );

    await use(pending);
  },

  text: async ({}, use: Use<DocumentText>) => {
    const { default: text } = await import(
      "./fixtures/documents/document.txt.json"
    );

    await use(text);
  },

  textPositions: async ({}, use: Use<TextPosition[]>) => {
    const { default: textPositions } = await import(
      "./fixtures/documents/examples/the-santa-anas-p1.position.json"
    );

    await use(textPositions);
  },
});

describe("document fetching", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test.todo("documents.get");
  test.todo("documents.search");

  test("documents.text public", async ({ document, text }) => {
    const mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      async json() {
        return text;
      },
    }));

    const endpoint = documents.jsonUrl(document);

    const t = await documents.text(document, mockFetch);
    expect(t).toMatchObject(text);

    expect(mockFetch).toHaveBeenCalledWith(endpoint);
  });

  test("documents.text private", async ({ document, text }) => {
    const { asset_url } = document;
    const privateText = new URL("private.txt.json", asset_url);
    const privateDoc = {
      ...document,
      access: "private",
      asset_url: new URL(document.asset_url, BASE_API_URL).href,
    } as Document;

    // to get private assets, we need to hit the API first for credentials
    // then fetch the actual asset from cloud storage
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      // call 2
      if (endpoint.toString() === privateText.toString()) {
        return {
          ok: true,
          async json() {
            return text;
          },
        };
      }

      // call 1
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            location: privateText,
          };
        },
      };
    });

    const t = await documents.text(privateDoc, mockFetch);
    expect(t).toMatchObject(text);

    // we need two fetches for private assets
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test("documents.textPositions", async ({ document, textPositions }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return textPositions;
        },
      };
    });

    const t = await documents.textPositions(document, 1, mockFetch);

    expect(t).toMatchObject(textPositions);
  });
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

    expect(mockFetch).toHaveBeenCalledWith(
      new URL("/api/documents/", DC_BASE),
      {
        body: JSON.stringify(docs),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          Referer: APP_URL,
          "X-CSRFToken": "token",
        },
        method: "POST",
      },
    );
  });

  test("documents.upload", async ({ created }) => {
    created.forEach(async (doc) => {
      const mockFetch = vi.fn().mockImplementation(async () => ({
        ok: true,
      }));

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
      expect(mockFetch).toHaveBeenCalledWith(new URL(doc.presigned_url), {
        body: file,
        headers: {
          "Content-Type": file.type,
        },
        method: "PUT",
      });
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
    expect(mockFetch).toHaveBeenCalledWith(
      new URL("/api/documents/process/", DC_BASE),
      {
        body: JSON.stringify(created.map((d) => ({ id: d.id }))),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          Referer: APP_URL,
          "X-CSRFToken": "csrf_token",
        },
        method: "POST",
      },
    );
  });

  test.todo("documents.cancel");

  test("pending", async ({ pending }) => {
    const mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      async json() {
        return pending;
      },
    }));

    documents.pending(mockFetch).then((p) => {
      expect(p).toMatchObject(pending);
    });
  });

  test("pending error", async () => {
    const mockFetch = vi.fn().mockImplementation(async () => {
      throw new Error("Bad fetch");
    });

    documents.pending(mockFetch).then((p) => {
      expect(p).toEqual([]);
    });
  });
});

describe("document helper methods", () => {
  test("assetUrl", async ({ document }) => {
    const privateDoc = {
      ...document,
      access: "private",
      asset_url: new URL("/files/", DC_BASE).href,
    } as Document;

    const processingDoc = {
      ...privateDoc,
      access: "public",
      status: "readable",
    } as Document;

    const privateUrl = documents.pdfUrl(privateDoc);

    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      // call 2
      if (endpoint.toString() === privateUrl.href) {
        return {
          ok: true,
          status: 200,
          async json() {
            return privateDoc;
          },
        };
      }

      // call 1
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            location: privateUrl,
          };
        },
      };
    });

    let asset_url = await documents.assetUrl(document, mockFetch);

    // for public documents, these are the same
    expect(asset_url).toStrictEqual(documents.pdfUrl(document));
    expect(mockFetch).toBeCalledTimes(0); // didn't use it

    // for private documents and those still processing, the URL should be private
    asset_url = await documents.assetUrl(privateDoc, mockFetch);

    expect(asset_url).toStrictEqual(privateUrl);
    expect(mockFetch).toBeCalledTimes(1);

    // documents still processing are kind of private
    asset_url = await documents.assetUrl(processingDoc, mockFetch);

    expect(asset_url).toStrictEqual(privateUrl);
    expect(mockFetch).toBeCalledTimes(2); // we've called it twice now
  });

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

  test("pageHashUrl", () => {
    expect(documents.pageHashUrl(1)).toStrictEqual(`#document/p1`);
  });

  test("pageFromHash", () => {
    const hash = documents.pageHashUrl(10);

    expect(documents.pageFromHash(hash)).toStrictEqual(10);

    // invalid hash returns page 1
    expect(documents.pageFromHash("#nopage")).toStrictEqual(1);

    // match a note hash
    expect(documents.pageFromHash("#document/p2/a2000002")).toStrictEqual(2);
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
