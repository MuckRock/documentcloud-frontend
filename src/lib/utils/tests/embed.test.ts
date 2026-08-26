import { describe, test, expect } from "vitest";
import {
  createEmbedSearchParams,
  getConfigDefaults,
  getEmbedSettings,
  isEmbed,
  reroute,
  truthy,
  type EmbedConfig,
} from "../embed";
import {
  documentSettings,
  documentDefaults,
  projectSettings,
  projectDefaults,
} from "../embedConfig";

describe("embed settings", () => {
  test("settingsConfig", () => {
    expect(documentSettings).toMatchSnapshot();
  });

  test("projectSettingsConfig", () => {
    expect(projectSettings).toMatchSnapshot();
  });

  test("createEmbedSearchParams", () => {
    expect(
      createEmbedSearchParams({ title: null }, documentDefaults).toString(),
    ).toEqual("");
    expect(
      createEmbedSearchParams({ title: 0 }, documentDefaults).toString(),
    ).toEqual("title=0");
    expect(
      createEmbedSearchParams(
        { title: 1, pdf: 0 },
        documentDefaults,
      ).toString(),
    ).toEqual("pdf=0");
  });

  test("createEmbedSearchParams with select field", () => {
    // the default option is omitted from the query string
    expect(
      createEmbedSearchParams({ sort: "none" }, projectDefaults).toString(),
    ).toEqual("");
    // non-default string values are serialized
    expect(
      createEmbedSearchParams({ sort: "title" }, projectDefaults).toString(),
    ).toEqual("sort=title");
    expect(
      createEmbedSearchParams(
        { sort: "-created_at" },
        projectDefaults,
      ).toString(),
    ).toEqual("sort=-created_at");
    // mixes select and toggle fields, dropping defaults
    expect(
      createEmbedSearchParams(
        { title: 1, description: 0, sort: "created_at", view: 0 },
        projectDefaults,
      ).toString(),
    ).toEqual("description=0&sort=created_at&view=0");
  });

  test("getEmbedSettings", () => {
    const url = new URL("https://www.documentcloud.org");
    url.searchParams.set("pdf", "false");
    url.searchParams.set("onlyshoworg", "true");
    url.searchParams.set("title", "0");
    expect(getEmbedSettings(url.searchParams, documentDefaults)).toEqual({
      ...documentDefaults,
      pdf: false,
      onlyshoworg: true,
      title: 0,
      fullscreen: 1,
    });
  });

  test("getEmbedSettings returns defaults when no params are set", () => {
    const url = new URL("https://www.documentcloud.org");
    expect(getEmbedSettings(url.searchParams, projectDefaults)).toEqual(
      projectDefaults,
    );
  });

  test("getEmbedSettings reads project toggle params", () => {
    const url = new URL("https://www.documentcloud.org");
    url.searchParams.set("title", "0");
    url.searchParams.set("view", "0");
    expect(getEmbedSettings(url.searchParams, projectDefaults)).toEqual({
      ...projectDefaults,
      title: 0,
      view: 0,
    });
  });

  test("getEmbedSettings preserves string select values", () => {
    const url = new URL("https://www.documentcloud.org");
    // string-valued fields (select) must survive untouched, not be coerced
    url.searchParams.set("sort", "-created_at");
    url.searchParams.set("view", "0");
    expect(getEmbedSettings(url.searchParams, projectDefaults)).toEqual({
      ...projectDefaults,
      sort: "-created_at",
      view: 0,
    });
  });
});

describe("getConfigDefaults", () => {
  test("extracts defaultValue from each setting", () => {
    const config = {
      title: { defaultValue: 1, field: { type: "hidden" } },
      sort: { defaultValue: "none", field: { type: "hidden" } },
      width: { defaultValue: null, field: { type: "hidden" } },
    } satisfies EmbedConfig;

    expect(getConfigDefaults(config)).toEqual({
      title: 1,
      sort: "none",
      width: null,
    });
  });

  test("documentDefaults matches documentSettings", () => {
    expect(documentDefaults).toEqual({
      title: 1,
      pdf: 1,
      fullscreen: 1,
      onlyshoworg: 0,
    });
  });

  test("projectDefaults matches projectSettings", () => {
    expect(projectDefaults).toEqual({
      title: 1,
      description: 1,
      sort: "none",
      view: 1,
    });
  });
});

describe("embed utilities", () => {
  test("isEmbed", () => {
    const urls: [string, boolean][] = [
      [
        "https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/",
        false,
      ],
      [
        "https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/?embed=1",
        true,
      ],
      [
        "https://embed.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/",
        true,
      ],
      [
        "https://embed.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/?embed=1",
        true,
      ],
      [
        "https://www.documentcloud.org/documents/2622-agreement-between-conservatives-and-liberal-democrats-to-form-a-coalition-government/?embed",
        true,
      ],
      [
        "https://embed.documentcloud.org/_app/immutable/chunks/navigation.CziXxwWJ.js",
        false,
      ],
    ];

    for (const [url, embed] of urls) {
      expect(isEmbed(new URL(url))).toEqual(embed);
    }
  });

  test("embed reroute", () => {
    // [original, rewritten]
    const paths: [string, string][] = [
      ["/embed/documents/1-slug/", "/embed/documents/1-slug/"],
      ["/documents/1-slug/?embed=1", "/embed/documents/1-slug/"],
      [
        "https://embed.documentcloud.org/documents/1-slug/",
        "/embed/documents/1-slug/",
      ],
    ];

    for (const [original, rewritten] of paths) {
      const url = new URL(original, "https://www.documentcloud.org");
      expect(reroute({ url, fetch: globalThis.fetch })).toEqual(rewritten);
    }
  });
});

test("truthy", () => {
  // Test undefined
  expect(truthy(undefined)).toBe(false);

  // Test null
  expect(truthy(null)).toBe(false);

  // Test boolean inputs
  expect(truthy(true)).toBe(true);
  expect(truthy(false)).toBe(false);

  // Test number inputs
  expect(truthy(1)).toBe(1);
  expect(truthy(0)).toBe(0);

  // Test string inputs for boolean values
  expect(truthy("true")).toBe(true);
  expect(truthy("false")).toBe(false);

  // Test string inputs for number values
  expect(truthy("1")).toBe(1);
  expect(truthy("0")).toBe(0);

  // Test JSON parsing
  expect(truthy('{"key": "value"}')).toEqual(true);
  expect(truthy("[1, 2, 3]")).toEqual(true);

  // Test invalid JSON string
  expect(truthy("invalid")).toBe(false);
});
