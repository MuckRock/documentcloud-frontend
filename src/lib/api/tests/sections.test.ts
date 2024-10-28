import type { Document, Section, SectionResults } from "../types";

import { vi, test as base, describe, expect, afterEach } from "vitest";

import { APP_URL, BASE_API_URL, CSRF_HEADER_NAME } from "@/config/config.js";
import * as sections from "../sections";

type Use<T> = (value: T) => Promise<void>;

const test = base.extend({
  async document({}, use: Use<Document>) {
    const document = await import(
      "@/test/fixtures/documents/document-expanded.json"
    );

    await use(document as Document);
  },

  async sectionList({}, use: Use<SectionResults>) {
    const results = await import("@/test/fixtures/sections.json");

    await use(results);
  },
});

describe("sections: reading", () => {
  test.todo("sections.get");
  test.todo("sections.list");
});

describe("sections: writing", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test("sections.create", async ({ document }) => {
    const section: Section = {
      id: 1,
      page_number: 1,
      title: "Title",
    };

    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 201,
        async json() {
          return section;
        },
      };
    });

    const { data: result, error } = await sections.create(
      document.id,
      { page_number: 1, title: "Title" },
      "token",
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toStrictEqual(section);
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/sections/`, BASE_API_URL),
      {
        credentials: "include",
        body: JSON.stringify({ page_number: 1, title: "Title" }),
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        method: "POST",
      },
    );
  });

  test("sections.update", async ({ document, sectionList }) => {
    const section = sectionList.results[0]!;

    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      const updated = { ...section, ...JSON.parse(options.body) };
      return {
        ok: true,
        status: 200,
        async json() {
          return updated;
        },
      };
    });

    const update: Partial<Section> = {
      title: "New title",
    };

    const { data: result, error } = await sections.update(
      document.id,
      section.id,
      update,
      "token",
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(result).toMatchObject({ ...section, ...update });
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/sections/${section.id}/`, BASE_API_URL),
      {
        credentials: "include",
        body: JSON.stringify(update),
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        method: "PATCH",
      },
    );
  });

  test("sections.remove", async ({ document, sectionList }) => {
    const section = sectionList.results[0]!;
    const mockFetch = vi.fn().mockImplementation(async (endpoint, options) => {
      return {
        ok: true,
        status: 204,
      };
    });

    const { error } = await sections.remove(
      document.id,
      section.id,
      "token",
      mockFetch,
    );

    expect(error).toBeUndefined();
    expect(mockFetch).toBeCalledWith(
      new URL(`documents/${document.id}/sections/${section.id}/`, BASE_API_URL),
      {
        credentials: "include",
        headers: {
          "Content-type": "application/json",
          [CSRF_HEADER_NAME]: "token",
          Referer: APP_URL,
        },
        method: "DELETE",
      },
    );
  });
});
