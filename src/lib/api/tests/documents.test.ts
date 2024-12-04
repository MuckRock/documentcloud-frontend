import type {
  DataUpdate,
  Document,
  DocumentResults,
  DocumentText,
  DocumentUpload,
  Pending,
  Redaction,
  Sizes,
  Status,
  TextPosition,
  ViewerMode,
} from "../types";

import { vi, test as base, describe, expect, afterEach } from "vitest";
import {
  APP_URL,
  BASE_API_URL,
  CSRF_HEADER_NAME,
  DC_BASE,
  EMBED_URL,
  IMAGE_WIDTHS_ENTRIES,
} from "@/config/config.js";

import * as documents from "../documents";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  search: async ({}, use: Use<DocumentResults>) => {
    const results = await import(
      "@/test/fixtures/documents/search-highlight.json"
    );

    await use(results as unknown as DocumentResults);
  },

  document: async ({}, use: Use<Document>) => {
    const document = await import(
      "@/test/fixtures/documents/document-expanded.json"
    );

    await use(document as Document);
  },

  documents: async ({}, use: Use<DocumentResults>) => {
    const { default: documents } = await import(
      "@/test/fixtures/documents/documents.json"
    );

    await use(documents as DocumentResults);
  },

  created: async ({}, use: Use<Document>) => {
    const { default: created } = await import(
      "@/test/fixtures/documents/create.json"
    );

    await use(created[0] as Document);
  },

  pending: async ({}, use: Use<Pending[]>) => {
    const { default: pending } = await import(
      "@/test/fixtures/documents/pending.json"
    );

    await use(pending);
  },

  text: async ({}, use: Use<DocumentText>) => {
    const { default: text } = await import(
      "@/test/fixtures/documents/document.txt.json"
    );

    await use(text);
  },

  textPositions: async ({}, use: Use<TextPosition[]>) => {
    const { default: textPositions } = await import(
      "@/test/fixtures/documents/examples/the-santa-anas-p1.position.json"
    );

    await use(textPositions);
  },

  redactions: async ({}, use: Use<Redaction[]>) => {
    const { default: redactions } = await import(
      "@/test/fixtures/documents/redactions.json"
    );

    await use(redactions);
  },
});

describe("document fetching", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("documents.get", async ({ document }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return document;
        },
      };
    });

    const { data: result, error } = await documents.get(
      +document.id,
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toStrictEqual(document);
    expect(mockFetch).toBeCalledWith(
      new URL(
        `documents/${document.id}.json?expand=user%2Corganization%2Cprojects%2Crevisions%2Csections%2Cnotes.user`,
        BASE_API_URL,
      ),
      {
        credentials: "include",
      },
    );
  });

  test("documents.list", async ({ documents: docs }) => {
    const ids = docs.results.map((d) => d.id);
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return docs;
        },
      };
    });

    const { data, error } = await documents.list(
      { id__in: ids.join(",") },
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(data).toEqual(docs);
  });

  test("documents.search", async ({ search }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {
          return search;
        },
      };
    });

    const { data: results, error } = await documents.search(
      "boston",
      { hl: true },
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(results).toStrictEqual(search);
    expect(mockFetch).toBeCalledWith(
      new URL(
        "documents/search/?expand=user%2Corganization%2Cprojects&q=boston&hl=true",
        BASE_API_URL,
      ),
      { credentials: "include" },
    );
  });

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

    mockFetch.mockRejectedValue(new Error("Failed to fetch"));
    expect(await documents.textPositions(document, 1, mockFetch)).toEqual([]);
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

    const docs: DocumentUpload = {
      title: created.title,
      access: created.access,
      language: created.language,
      original_extension: created.original_extension,
    };

    const { data } = await documents.create(docs, "token", mockFetch);
    expect(data).toMatchObject(created);

    expect(mockFetch).toHaveBeenCalledWith(
      new URL("/api/documents/", DC_BASE),
      {
        body: JSON.stringify(docs),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          Referer: APP_URL,
          [CSRF_HEADER_NAME]: "token",
        },
        method: "POST",
      },
    );
  });

  test("documents.upload", async ({ created }) => {
    const mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
    }));

    const file = new File(
      ["test content"],
      "finalseasonal-allergies-pollen-and-mold-2023-en.pdf",
      { type: "application/pdf" },
    );

    const resp = await documents.upload(
      new URL(created.presigned_url as string), // we know what this is
      file,
      mockFetch,
    );

    expect(resp.ok).toBeTruthy();
    expect(mockFetch).toHaveBeenCalledWith(
      new URL(created.presigned_url as string),
      {
        body: file,
        headers: {
          "Content-Type": file.type,
        },
        method: "PUT",
      },
    );
  });

  test("documents.process", async ({ created }) => {
    const mockFetch = vi.fn().mockImplementation(async () => ({
      ok: true,
      async json() {
        return "OK";
      },
    }));

    const { data } = await documents.process(
      [{ id: created.id }],
      "csrf_token",
      mockFetch,
    );

    expect(data).toEqual("OK");
    expect(mockFetch).toHaveBeenCalledWith(
      new URL("/api/documents/process/", DC_BASE),
      {
        body: JSON.stringify([{ id: created.id }]),
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          Referer: APP_URL,
          [CSRF_HEADER_NAME]: "csrf_token",
        },
        method: "POST",
      },
    );
  });

  test("documents.cancel", async ({ document }) => {
    const csrf_token = "token";
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 200,
        async json() {},
      };
    });

    // cancelling a finished document is a noop
    let { data } = await documents.cancel(document, csrf_token, mockFetch);

    expect(data).toBeUndefined();

    ({ data } = await documents.cancel(
      { ...document, status: "pending" },
      csrf_token,
      mockFetch,
    ));
    expect(data).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`/api/documents/${document.id}/process/`, BASE_API_URL),
      {
        credentials: "include",
        method: "DELETE",
        headers: {
          [CSRF_HEADER_NAME]: csrf_token,
          Referer: APP_URL,
        },
      },
    );

    await documents.cancel(
      { ...document, status: "readable" },
      csrf_token,
      mockFetch,
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // error and nofile status are also done, so cancel does nothing
    await documents.cancel(
      { ...document, status: "error" },
      csrf_token,
      mockFetch,
    );
    await documents.cancel(
      { ...document, status: "nofile" },
      csrf_token,
      mockFetch,
    );

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

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

describe("document write methods", () => {
  test("documents.destroy", async ({ document }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 204,
        json() {},
      };
    });

    const { data, error } = await documents.destroy(
      document.id,
      "token",
      mockFetch,
    );

    expect(data).toBeUndefined();
    expect(error).toBeUndefined();
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/`, BASE_API_URL),
      {
        credentials: "include",
        method: "DELETE",
        headers: {
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
      },
    );
  });

  test("documents.destroy_many", async ({ documents: docs }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 204,
        async json() {},
      };
    });

    const ids = docs.results.map((d) => d.id);
    const endpoint = new URL("documents/", BASE_API_URL);
    endpoint.searchParams.set("id__in", ids.join(","));

    const { data, error } = await documents.destroy_many(
      ids,
      "token",
      mockFetch,
    );

    expect(data).toBeUndefined();
    expect(error).toBeUndefined();
    expect(mockFetch).toBeCalledWith(endpoint, {
      credentials: "include",
      method: "DELETE",
      headers: {
        [CSRF_HEADER_NAME]: "token",
        Referer: APP_URL,
      },
    });
  });

  test("documents.edit", async ({ document }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      const body = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        json() {
          return { ...document, ...body };
        },
      };
    });

    const { data: updated, error } = await documents.edit(
      document.id,
      { title: "Updated title" },
      "token",
      mockFetch,
    );

    expect(updated?.title).toStrictEqual("Updated title");
  });

  test("documents.edit_many", async ({ documents: docs }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      const body = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        json() {
          return body;
        },
      };
    });

    const update = docs.results.map((d) => ({ ...d, source: "New source" }));
    const { error } = await documents.edit_many(update, "token", mockFetch);

    expect(error).toBeUndefined();

    expect(mockFetch).toHaveBeenCalledWith(
      new URL("documents/", BASE_API_URL),
      {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        body: JSON.stringify(update),
      },
    );
  });

  test("documents.add_tags", async ({ document }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      // fake update
      endpoint = new URL(endpoint);
      const key = endpoint.pathname.split("/").filter(Boolean).pop();
      const body: DataUpdate = JSON.parse(options.body);
      const data = { ...document.data };

      data[key] = [...(data[key] ?? []), ...body.values];

      return {
        ok: true,
        status: 200,
        async json() {
          return data;
        },
      };
    });

    const { data } = await documents.add_tags(
      document.id,
      "_tag",
      ["one", "two"],
      "token",
      mockFetch,
    );

    expect(data?.["_tag"]).toEqual(["one", "two"]);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/data/_tag/`, BASE_API_URL),
      {
        credentials: "include",
        method: "PATCH",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        body: JSON.stringify({
          values: ["one", "two"],
        }),
      },
    );
  });

  test("documents.redact", async ({ document, redactions }) => {
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      // the api returns the same redaction it was sent
      const body = JSON.parse(options.body);
      return {
        ok: true,
        status: 201,
        async json() {
          return body;
        },
      };
    });

    const resp = await documents.redact(
      document.id,
      redactions,
      "token",
      mockFetch,
    );

    expect(resp.status).toStrictEqual(201);
    expect(await resp.json()).toStrictEqual(redactions);

    expect(mockFetch).toHaveBeenCalledWith(
      new URL(`documents/${document.id}/redactions/`, BASE_API_URL),
      {
        body: JSON.stringify(redactions),
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

    const privateUrl = new URL("private.pdf", privateDoc.asset_url);

    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      // call 2
      if (endpoint.toString() === privateUrl.toString()) {
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
            location: privateUrl.href,
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

  test("embedUrl", ({ document }) => {
    expect(documents.embedUrl(document)).toStrictEqual(
      new URL(`/documents/${document.id}-${document.slug}/?embed=1`, EMBED_URL),
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
    expect(documents.pageFromHash("#nopage")).toStrictEqual(null);

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
    const d2 = (await import(
      "@/test/fixtures/documents/document.json"
    )) as Document;
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

  test("shouldPreload", () => {
    const yes: ViewerMode[] = ["annotating", "document", "notes", "redacting"];
    const no: ViewerMode[] = ["grid", "text"];

    yes.forEach((mode) => {
      expect(documents.shouldPreload(mode)).toBeTruthy();
    });

    no.forEach((mode) => {
      expect(documents.shouldPreload(mode)).toBeFalsy();
    });
  });

  test("shouldPaginate", () => {
    const yes: ViewerMode[] = ["annotating", "document", "redacting", "text"];
    const no: ViewerMode[] = ["grid", "notes"];

    yes.forEach((mode) => {
      expect(documents.shouldPaginate(mode)).toBeTruthy();
    });

    no.forEach((mode) => {
      expect(documents.shouldPaginate(mode)).toBeFalsy();
    });
  });

  test("isProcessing", () => {
    const yes: Status[] = ["pending", "readable", "nofile"];
    const no: Status[] = ["error", "success"];

    yes.forEach((status) => {
      expect(documents.isProcessing(status)).toBeTruthy();
    });

    no.forEach((status) => {
      expect(documents.isProcessing(status)).toBeFalsy();
    });
  });
});
